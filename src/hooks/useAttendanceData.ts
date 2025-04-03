
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AttendanceRecord {
  [key: string]: {
    [date: string]: {
      is_present: boolean;
      absence_reason?: string;
    };
  };
}

export const useAttendanceData = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord>({});

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
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
        console.error('Error fetching attendance data:', error);
        toast.error('Ошибка при загрузке данных посещаемости');
      }
    };

    fetchAttendance();
  }, []);

  useEffect(() => {
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

    return () => {
      supabase.removeChannel(attendanceChannel);
    };
  }, []);

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
    attendance,
    updateAttendance,
    updateAbsenceReason
  };
};
