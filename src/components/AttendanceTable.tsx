import React, { useState, useMemo, useEffect } from 'react';
import { 
  ViewType, getDatesForView, exportToExcel, isLateSync 
} from "@/utils/attendanceUtils";
import { useAttendanceSync } from '@/hooks/useAttendanceSync';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LessonTimeSelector from './LessonTimeSelector';
import AttendanceFilters from './attendance/AttendanceFilters';
import AttendanceTableView from './attendance/AttendanceTableView';
import LateStudentsView from './attendance/LateStudentsView';
import MissingStudentsView from './attendance/MissingStudentsView';

const AttendanceTable = () => {
  const { students, attendance, updateAttendance, updateAbsenceReason } = useAttendanceSync();
  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [lessonStartTime, setLessonStartTime] = useState<string | null>(null);
  const [lateStudentIds, setLateStudentIds] = useState<string[]>([]);

  const dates = getDatesForView(viewType, selectedMonth);

  useEffect(() => {
    const fetchLateStudents = async () => {
      if (viewType !== 'day' || dates.length === 0) return;
      
      try {
        const today = dates[0];
        
        const { data, error } = await supabase
          .from('late_students')
          .select('student_id')
          .eq('date', today) as any;
        
        if (error) throw error;
        
        const lateIds = data.map((item: any) => item.student_id);
        setLateStudentIds(lateIds);
      } catch (error) {
        console.error('Ошибка при загрузке списка опоздавших:', error);
      }
    };
    
    fetchLateStudents();
  }, [viewType, dates]);

  const handleAttendanceChange = (studentId: string, date: string, checked: boolean) => {
    updateAttendance(studentId, date, checked);
  };

  const handleAbsenceReasonChange = async (studentId: string, date: string, reason: string) => {
    try {
      await updateAbsenceReason(studentId, date, reason);
      toast.success('Причина отсутствия обновлена');
    } catch (error) {
      toast.error('Ошибка при обновлении причины отсутствия');
    }
  };

  const handleExport = () => {
    exportToExcel(students, dates, attendance);
  };

  const handleTimeSelected = (time: string) => {
    setLessonStartTime(time);
  };

  const missingStudents = useMemo(() => {
    if (viewType !== 'day' || dates.length === 0) return [];
    
    const currentDate = dates[0];
    return students.filter(student => !attendance[student.id]?.[currentDate]?.is_present);
  }, [students, attendance, dates, viewType]);

  const lateStudents = useMemo(() => {
    if (viewType !== 'day' || dates.length === 0) return [];

    const currentDate = dates[0];
    return students.filter(student => 
      isLateSync(student.id, currentDate, attendance, lateStudentIds)
    );
  }, [students, attendance, dates, viewType, lateStudentIds]);

  useEffect(() => {
    if (viewType !== 'day' || dates.length === 0) return;
    
    const today = dates[0];
    
    const channel = supabase
      .channel('late_students_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'late_students', filter: `date=eq.${today}` },
        (payload) => {
          const fetchLatestLateStudents = async () => {
            try {
              const { data, error } = await supabase
                .from('late_students')
                .select('student_id')
                .eq('date', today) as any;
              
              if (error) throw error;
              
              const lateIds = data.map((item: any) => item.student_id);
              setLateStudentIds(lateIds);
            } catch (error) {
              console.error('Ошибка при загрузке обновленного списка опоздавших:', error);
            }
          };
          
          fetchLatestLateStudents();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewType, dates]);

  return (
    <div className="w-full">
      <div className="min-w-[320px]">
        <AttendanceFilters 
          viewType={viewType}
          selectedMonth={selectedMonth}
          onViewTypeChange={setViewType}
          onSelectedMonthChange={setSelectedMonth}
          onExport={handleExport}
          students={students}
        />

        {viewType === "day" && <LessonTimeSelector 
          onTimeSelected={handleTimeSelected} 
          students={students}
          attendance={attendance}
        />}

        <AttendanceTableView 
          students={students}
          dates={dates}
          attendance={attendance}
          viewType={viewType}
          handleAttendanceChange={handleAttendanceChange}
        />

        {viewType === 'day' && dates.length > 0 && (
          <>
            <LateStudentsView 
              students={students}
              lateStudentIds={lateStudentIds}
              attendance={attendance}
              currentDate={dates[0]}
              onAbsenceReasonChange={handleAbsenceReasonChange}
            />
            
            <MissingStudentsView 
              missingStudents={missingStudents}
              attendance={attendance}
              currentDate={dates[0]}
              onAbsenceReasonChange={handleAbsenceReasonChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
