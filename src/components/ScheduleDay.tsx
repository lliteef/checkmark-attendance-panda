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

interface ScheduleDayProps {
  daySchedule: ScheduleItem[];
  dayName: string;
}

const ScheduleDay: React.FC<ScheduleDayProps> = ({ daySchedule, dayName }) => {
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

  if (!daySchedule || daySchedule.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Нет пар в этот день
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {daySchedule.map((item) => (
        <Card key={item.id} className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {item.lesson_number}. {item.lesson.name}
              </CardTitle>
              {item.week_type !== 'all' && (
                <Badge variant={getWeekTypeBadgeVariant(item.week_type)}>
                  {getWeekTypeLabel(item.week_type)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Преподаватель:</strong> {item.lesson.teacher}</p>
              <p><strong>Кабинет:</strong> {item.lesson.room}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ScheduleDay;