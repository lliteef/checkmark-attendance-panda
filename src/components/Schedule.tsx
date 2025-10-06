import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import ScheduleDay from './ScheduleDay';
import ScheduleWeek from './ScheduleWeek';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleLesson {
  id: string;
  name: string;
  teacher: string;
  room: string;
}

interface ScheduleItem {
  id: string;
  lesson_number: number;
  week_type: 'all' | 'numerator' | 'denominator';
  lesson: ScheduleLesson;
}

interface DaySchedule {
  [key: number]: ScheduleItem[];
}

const Schedule = () => {
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const isMobile = useIsMobile();

  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data: groupData } = await supabase
        .from('schedule_groups')
        .select('id')
        .eq('name', '0941')
        .single();

      if (!groupData) return;

      // Fetch schedule items and lessons separately, then combine them
      const { data: scheduleItems } = await supabase
        .from('schedule_items')
        .select('id, day_of_week, lesson_number, week_type, lesson_id')
        .eq('group_id', groupData.id);

      const { data: lessons } = await supabase
        .from('schedule_lessons')
        .select('id, name, teacher, room');

      if (scheduleItems && lessons) {
        // Create a lookup map for lessons
        const lessonMap = new Map();
        lessons.forEach(lesson => {
          lessonMap.set(lesson.id, lesson);
        });

        // Combine schedule items with lesson details
        const groupedSchedule: DaySchedule = {};
        scheduleItems.forEach((item: any) => {
          if (!groupedSchedule[item.day_of_week]) {
            groupedSchedule[item.day_of_week] = [];
          }
          
          const lesson = lessonMap.get(item.lesson_id);
          if (lesson) {
            groupedSchedule[item.day_of_week].push({
              id: item.id,
              lesson_number: item.lesson_number,
              week_type: item.week_type,
              lesson: lesson
            });
          }
        });

        // Sort lessons by lesson_number
        Object.keys(groupedSchedule).forEach(day => {
          groupedSchedule[parseInt(day)].sort((a, b) => a.lesson_number - b.lesson_number);
        });

        setSchedule(groupedSchedule);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    setCurrentDay(prev => {
      const newDay = prev - 1;
      return newDay < 1 ? 5 : newDay; // Skip weekend
    });
  };

  const handleNextDay = () => {
    setCurrentDay(prev => {
      const newDay = prev + 1;
      return newDay > 5 ? 1 : newDay; // Skip weekend
    });
  };

  const handleToday = () => {
    const today = new Date().getDay();
    setCurrentDay(today === 0 || today === 6 ? 1 : today); // If weekend, show Monday
  };

  if (loading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">Загрузка расписания...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Расписание группы 0941
        </CardTitle>
        {isMobile && (
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="icon" onClick={handlePrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold">{dayNames[currentDay]}</h3>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Сегодня
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <ScheduleDay 
            daySchedule={schedule[currentDay] || []} 
            dayName={dayNames[currentDay]}
          />
        ) : (
          <ScheduleWeek schedule={schedule} dayNames={dayNames} />
        )}
      </CardContent>
    </Card>
  );
};

export default Schedule;