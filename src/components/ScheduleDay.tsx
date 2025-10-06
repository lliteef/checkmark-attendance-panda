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

  // Group lessons by lesson_number
  const groupedLessons = daySchedule.reduce((acc, item) => {
    if (!acc[item.lesson_number]) {
      acc[item.lesson_number] = [];
    }
    acc[item.lesson_number].push(item);
    return acc;
  }, {} as { [key: number]: ScheduleItem[] });

  return (
    <div className="space-y-2">
      {Object.entries(groupedLessons).map(([lessonNumber, items]) => {
        const hasMultiple = items.length > 1;
        const numerator = items.find(i => i.week_type === 'numerator');
        const denominator = items.find(i => i.week_type === 'denominator');
        const single = items.find(i => i.week_type === 'all');

        return (
          <Card key={lessonNumber} className="border-l-4 border-l-primary">
            <CardContent className="p-3">
              {hasMultiple ? (
                <div className="grid grid-cols-1 divide-y">
                  {numerator && (
                    <div className="py-2 first:pt-0 last:pb-0">
                      <div className="font-medium">{numerator.lesson_number}. {numerator.lesson.name}</div>
                      <div className="text-sm text-muted-foreground">{numerator.lesson.teacher} ({numerator.lesson.room})</div>
                    </div>
                  )}
                  {denominator && (
                    <div className="py-2 first:pt-0 last:pb-0">
                      <div className="font-medium">{denominator.lesson_number}. {denominator.lesson.name}</div>
                      <div className="text-sm text-muted-foreground">{denominator.lesson.teacher} ({denominator.lesson.room})</div>
                    </div>
                  )}
                </div>
              ) : single ? (
                <>
                  <div className="font-medium">{single.lesson_number}. {single.lesson.name}</div>
                  <div className="text-sm text-muted-foreground">{single.lesson.teacher} ({single.lesson.room})</div>
                </>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ScheduleDay;