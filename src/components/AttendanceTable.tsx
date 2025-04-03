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
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { RefreshCcw } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

const AttendanceTable = () => {
  const { students, attendance, updateAttendance, updateAbsenceReason } = useAttendanceSync();
  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [lessonStartTime, setLessonStartTime] = useState<string | null>(null);
  const [lateStudentIds, setLateStudentIds] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const isMobile = useIsMobile();

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

  const resetCurrentDay = async () => {
    if (dates.length === 0) return;
    
    setIsResetting(true);
    
    try {
      const today = dates[0];
      
      await supabase
        .from('lesson_times')
        .delete()
        .eq('date', today);
      
      await supabase
        .from('attendance_records')
        .delete()
        .eq('date', today);
        
      await supabase
        .from('late_students')
        .delete()
        .eq('date', today);
      
      toast.success('Данные текущего дня сброшены');
      
      setLessonStartTime(null);
      setLateStudentIds([]);
    } catch (error) {
      console.error('Ошибка при сбросе данных:', error);
      toast.error('Ошибка при сбросе данных дня');
    } finally {
      setIsResetting(false);
    }
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
        <div className="flex justify-between items-center mb-4">
          <AttendanceFilters 
            viewType={viewType}
            selectedMonth={selectedMonth}
            onViewTypeChange={setViewType}
            onSelectedMonthChange={setSelectedMonth}
            onExport={handleExport}
            students={students}
          />
          
          {viewType === "day" && dates.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="ml-2 border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500"
                  disabled={isResetting}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Сбросить день</span>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Сбросить данные текущего дня?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие удалит все данные о посещаемости, причинах отсутствия, 
                    времени начала занятий и список опоздавших за текущий день. 
                    Данное действие невозможно отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={resetCurrentDay}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Сбросить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

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
