
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Student {
  id: string;
  name: string;
  position?: number;
}

export interface AttendanceRecord {
  [key: string]: {
    [date: string]: {
      is_present: boolean;
      absence_reason?: string;
    };
  };
}

export const useAttendanceSync = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .order('created_at');

        if (studentsError) throw studentsError;

        const transformedStudents = studentsData.map((s, index) => ({
          id: s.id,
          name: s.name,
          position: index
        }));
        setStudents(transformedStudents);

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*');

        if (attendanceError) throw attendanceError;

        const attendanceMap: AttendanceRecord = {};
        attendanceData.forEach((record) => {
          if (!attendanceMap[record.student_id]) {
            attendanceMap[record.student_id] = {};
          }
          attendanceMap[record.student_id][record.date] = {
            is_present: record.is_present || false,
            absence_reason: record.absence_reason
          };
        });
        setAttendance(attendanceMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Ошибка при загрузке данных');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const studentsChannel = supabase
      .channel('students_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          console.log('Students change received:', payload);
          supabase
            .from('students')
            .select('*')
            .order('created_at')
            .then(({ data, error }) => {
              if (error) {
                console.error('Error refreshing students:', error);
                return;
              }
              const transformedStudents = data.map((s, index) => ({
                id: s.id,
                name: s.name,
                position: index
              }));
              setStudents(transformedStudents);
            });
        }
      )
      .subscribe();

    const attendanceChannel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        (payload) => {
          console.log('Attendance change received:', payload);
          supabase
            .from('attendance_records')
            .select('*')
            .then(({ data, error }) => {
              if (error) {
                console.error('Error refreshing attendance:', error);
                return;
              }
              const attendanceMap: AttendanceRecord = {};
              data.forEach((record) => {
                if (!attendanceMap[record.student_id]) {
                  attendanceMap[record.student_id] = {};
                }
                attendanceMap[record.student_id][record.date] = {
                  is_present: record.is_present || false,
                  absence_reason: record.absence_reason
                };
              });
              setAttendance(attendanceMap);
            });
        }
      )
      .subscribe();

    // Добавляем подписку на изменения в таблицах lesson_times и late_students
    const lateStudentsChannel = supabase
      .channel('late_students_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'late_students' },
        (payload) => {
          console.log('Late students change received:', payload);
          // Обновление данных произойдет в компоненте AttendanceTable
        }
      )
      .subscribe();

    const lessonTimesChannel = supabase
      .channel('lesson_times_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_times' },
        (payload) => {
          console.log('Lesson times change received:', payload);
          // Обновление данных произойдет в компоненте LessonTimeSelector
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(lateStudentsChannel);
      supabase.removeChannel(lessonTimesChannel);
    };
  }, []);

  const addStudent = async (name: string, position: number = students.length) => {
    try {
      // Add new student
      const { data, error } = await supabase
        .from('students')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Ошибка при добавлении студента');
      throw error;
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Ошибка при удалении студента');
      throw error;
    }
  };

  const updateAttendance = async (studentId: string, date: string, isPresent: boolean) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          student_id: studentId,
          date,
          is_present: isPresent,
          absence_reason: isPresent ? null : attendance[studentId]?.[date]?.absence_reason
        }, {
          onConflict: 'student_id,date'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Ошибка при обновлении посещаемости');
      throw error;
    }
  };

  const updateAbsenceReason = async (studentId: string, date: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          student_id: studentId,
          date,
          is_present: false,
          absence_reason: reason
        }, {
          onConflict: 'student_id,date'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating absence reason:', error);
      throw error;
    }
  };

  return {
    students,
    attendance,
    addStudent,
    removeStudent,
    updateAttendance,
    updateAbsenceReason
  };
};
