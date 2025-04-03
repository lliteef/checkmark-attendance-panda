
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { getDefaultLessonStartTime } from "@/utils/attendanceUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LessonTimeSelectorProps {
  onTimeSelected: (time: string) => void;
  students: Array<{ id: string; name: string; }>;
  attendance: Record<string, any>;
}

const LessonTimeSelector: React.FC<LessonTimeSelectorProps> = ({ onTimeSelected, students, attendance }) => {
  const [lessonTime, setLessonTime] = useState<string>(getDefaultLessonStartTime());
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  useEffect(() => {
    // Проверяем, не выбиралось ли уже время сегодня в базе данных
    const fetchLessonTime = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('lesson_times')
          .select('start_time')
          .eq('date', today)
          .maybeSingle() as any;
        
        if (error) throw error;
        
        if (data) {
          setLessonTime(data.start_time);
          setIsFirstTime(false);
          onTimeSelected(data.start_time);
        } else {
          setIsFirstTime(true);
          setLessonTime(getDefaultLessonStartTime());
        }
      } catch (error) {
        console.error('Ошибка при получении времени начала занятий:', error);
        toast.error('Не удалось загрузить время начала занятий');
      }
    };
    
    fetchLessonTime();
    
    // Подписываемся на изменения в таблице lesson_times
    const lessonTimesChannel = supabase
      .channel('lesson_times_reset')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_times' },
        () => {
          // При изменении данных перезагружаем информацию
          fetchLessonTime();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(lessonTimesChannel);
    };
  }, [onTimeSelected]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLessonTime(e.target.value);
  };

  const handleTimeSubmit = async () => {
    try {
      // Получаем текущую дату в формате YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Сохраняем выбранное время для текущего дня в базе данных
      const { error: timeError } = await supabase
        .from('lesson_times')
        .upsert({ 
          date: today, 
          start_time: lessonTime 
        }, { 
          onConflict: 'date' 
        }) as any;
      
      if (timeError) throw timeError;
      
      // Проверяем, прошло ли уже время начала занятий
      const currentTime = new Date();
      const [hours, minutes] = lessonTime.split(':').map(Number);
      const lessonDateTime = new Date();
      lessonDateTime.setHours(hours, minutes, 0, 0);
      
      // При подтверждении времени начала занятий отмечаем студентов как опоздавших 
      // ТОЛЬКО если текущее время уже больше времени начала занятий
      const lateStudentRows: any[] = [];
      
      if (currentTime > lessonDateTime) {
        students.forEach(student => {
          const record = attendance[student.id]?.[today];
          // Если студент не отмечен присутствующим и у него нет причины отсутствия,
          // добавляем его в список опоздавших
          if (!record?.is_present && !record?.absence_reason) {
            lateStudentRows.push({
              student_id: student.id,
              date: today
            });
          }
        });
        
        // Сохраняем список опоздавших в базе данных
        if (lateStudentRows.length > 0) {
          const { error: lateError } = await supabase
            .from('late_students')
            .upsert(lateStudentRows, { 
              onConflict: 'student_id,date' 
            }) as any;
          
          if (lateError) throw lateError;
        }
      }
      
      onTimeSelected(lessonTime);
      setIsFirstTime(false);
      toast.success('Время начала занятий сохранено');
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      toast.error('Не удалось сохранить время начала занятий');
    }
  };

  if (!isFirstTime) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Время начала пар сегодня
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="time-input">
              Укажите время начала занятий (UTC+3, Московское время)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="time-input"
                type="time"
                value={lessonTime}
                onChange={handleTimeChange}
                className="w-40"
              />
              <Button onClick={handleTimeSubmit}>
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonTimeSelector;
