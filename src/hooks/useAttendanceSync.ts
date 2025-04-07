
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPreviousMonthStartDate, getCurrentMonthStartDate, checkIfShouldCleanupOldData } from '@/utils/attendanceUtils';

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

        // Ограничиваем запрос только данными за текущий месяц
        const currentMonthStart = getCurrentMonthStartDate();
        
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .gte('date', currentMonthStart);

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
        
        // Проверяем, нужно ли очистить старые данные
        if (checkIfShouldCleanupOldData()) {
          cleanupOldAttendanceData();
        }
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
          
          // При получении обновлений, загружаем только данные за текущий месяц
          const currentMonthStart = getCurrentMonthStartDate();
          
          supabase
            .from('attendance_records')
            .select('*')
            .gte('date', currentMonthStart)
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

    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(attendanceChannel);
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

  // Новая функция для очистки данных предыдущего месяца
  const cleanupOldAttendanceData = async () => {
    try {
      const previousMonthStart = getPreviousMonthStartDate();
      const currentMonthStart = getCurrentMonthStartDate();
      
      // Удаляем все записи о посещаемости за предыдущий месяц
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .delete()
        .lt('date', currentMonthStart);

      if (attendanceError) throw attendanceError;

      // Удаляем все записи о опоздавших за предыдущий месяц
      const { error: lateError } = await supabase
        .from('late_students')
        .delete()
        .lt('date', currentMonthStart);

      if (lateError) throw lateError;

      // Удаляем все записи о времени занятия за предыдущий месяц
      const { error: lessonTimeError } = await supabase
        .from('lesson_times')
        .delete()
        .lt('date', currentMonthStart);

      if (lessonTimeError) throw lessonTimeError;

      toast.success(`Данные до ${formatDateForDisplay(currentMonthStart)} успешно очищены`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      toast.error('Ошибка при очистке старых данных');
    }
  };

  // Функция для ручной очистки данных
  const manualCleanupOldData = async () => {
    try {
      await cleanupOldAttendanceData();
      // Обновляем состояние после очистки
      const currentMonthStart = getCurrentMonthStartDate();
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', currentMonthStart);

      if (error) throw error;

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
      
      return true;
    } catch (error) {
      console.error('Error in manual cleanup:', error);
      toast.error('Ошибка при очистке данных');
      return false;
    }
  };

  return {
    students,
    attendance,
    addStudent,
    removeStudent,
    updateAttendance,
    updateAbsenceReason,
    manualCleanupOldData
  };
};

// Вспомогательная функция для форматирования даты
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
