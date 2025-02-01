import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Student {
  id: string;
  name: string;
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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .order('name');

        if (studentsError) throw studentsError;

        const transformedStudents = studentsData.map(s => ({
          id: s.id,
          name: s.name
        }));
        setStudents(transformedStudents);

        // Fetch attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*');

        if (attendanceError) throw attendanceError;

        // Transform attendance data to include absence reasons
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

  // Set up real-time subscriptions
  useEffect(() => {
    const studentsChannel = supabase
      .channel('students_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          console.log('Students change received:', payload);
          // Refresh students data
          supabase
            .from('students')
            .select('*')
            .order('name')
            .then(({ data, error }) => {
              if (error) {
                console.error('Error refreshing students:', error);
                return;
              }
              const transformedStudents = data.map(s => ({
                id: s.id,
                name: s.name
              }));
              setStudents(transformedStudents);
              toast.success('Student list updated');
            });
        }
      )
      .subscribe();

    // Subscribe to attendance changes
    const attendanceChannel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        (payload) => {
          console.log('Attendance change received:', payload);
          // Refresh attendance data
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
                attendanceMap[record.student_id][record.date] = record.is_present;
              });
              setAttendance(attendanceMap);
              toast.success('Attendance records updated');
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(attendanceChannel);
    };
  }, []);

  const addStudent = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Студент добавлен');
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
      toast.success('Студент удален');
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
      toast.success(isPresent ? 'Присутствие отмечено' : 'Отсутствие отмечено');
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
