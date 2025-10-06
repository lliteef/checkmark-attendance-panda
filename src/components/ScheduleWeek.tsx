import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface ScheduleWeekProps {
  schedule: DaySchedule;
  dayNames: string[];
}

const ScheduleWeek: React.FC<ScheduleWeekProps> = ({ schedule, dayNames }) => {
  const getWeekTypeLabel = (weekType: string) => {
    switch (weekType) {
      case 'numerator': return 'числитель';
      case 'denominator': return 'знаменатель';
      default: return null;
    }
  };

  const getWeekTypeBadgeVariant = (weekType: string) => {
    switch (weekType) {
      case 'numerator': return 'default';
      case 'denominator': return 'secondary';
      default: return 'outline';
    }
  };

  const workDays = [1, 2, 3, 4, 5]; // Monday to Friday

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {workDays.map((dayIndex) => {
        // Group lessons by lesson_number
        const daySchedule = schedule[dayIndex] || [];
        const groupedLessons = daySchedule.reduce((acc, item) => {
          if (!acc[item.lesson_number]) {
            acc[item.lesson_number] = [];
          }
          acc[item.lesson_number].push(item);
          return acc;
        }, {} as { [key: number]: ScheduleItem[] });

        return (
          <Card key={dayIndex} className="h-fit">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-base text-center border-b pb-2">
                {dayNames[dayIndex]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              {Object.keys(groupedLessons).length > 0 ? (
                Object.entries(groupedLessons).map(([lessonNumber, items]) => {
                  const hasMultiple = items.length > 1;
                  const numerator = items.find(i => i.week_type === 'numerator');
                  const denominator = items.find(i => i.week_type === 'denominator');
                  const single = items.find(i => i.week_type === 'all');

                  return (
                    <div key={lessonNumber} className="p-2 border rounded-lg bg-card text-xs">
                      {hasMultiple ? (
                        <div className="grid grid-cols-1 divide-y">
                          {numerator && (
                            <div className="py-1.5 first:pt-0 last:pb-0">
                              <div className="font-medium leading-tight">{numerator.lesson_number}. {numerator.lesson.name}</div>
                              <div className="text-muted-foreground mt-0.5">{numerator.lesson.teacher} ({numerator.lesson.room})</div>
                            </div>
                          )}
                          {denominator && (
                            <div className="py-1.5 first:pt-0 last:pb-0">
                              <div className="font-medium leading-tight">{denominator.lesson_number}. {denominator.lesson.name}</div>
                              <div className="text-muted-foreground mt-0.5">{denominator.lesson.teacher} ({denominator.lesson.room})</div>
                            </div>
                          )}
                        </div>
                      ) : single ? (
                        <>
                          <div className="font-medium leading-tight">{single.lesson_number}. {single.lesson.name}</div>
                          <div className="text-muted-foreground mt-0.5">{single.lesson.teacher} ({single.lesson.room})</div>
                        </>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground text-xs py-4">
                  Нет пар
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ScheduleWeek;