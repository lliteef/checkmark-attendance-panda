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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {workDays.map((dayIndex) => (
        <Card key={dayIndex} className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center border-b pb-2">
              {dayNames[dayIndex]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {schedule[dayIndex] && schedule[dayIndex].length > 0 ? (
              schedule[dayIndex].map((item) => (
                <div key={item.id} className="p-3 border rounded-lg bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {item.lesson_number}.
                    </span>
                    {item.week_type !== 'all' && (
                      <Badge 
                        variant={getWeekTypeBadgeVariant(item.week_type)}
                        className="text-xs"
                      >
                        {getWeekTypeLabel(item.week_type)}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-sm mb-2 leading-tight">
                    {item.lesson.name}
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{item.lesson.teacher}</p>
                    <p>Кабинет: {item.lesson.room}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                Нет пар
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ScheduleWeek;