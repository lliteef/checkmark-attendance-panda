
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { getDefaultLessonStartTime } from "@/utils/attendanceUtils";

interface LessonTimeSelectorProps {
  onTimeSelected: (time: string) => void;
}

const LessonTimeSelector: React.FC<LessonTimeSelectorProps> = ({ onTimeSelected }) => {
  const [lessonTime, setLessonTime] = useState<string>(getDefaultLessonStartTime());
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  useEffect(() => {
    // Проверяем, не выбиралось ли уже время сегодня
    const today = new Date().toISOString().split('T')[0];
    const savedTime = localStorage.getItem(`lesson_start_time_${today}`);
    
    if (savedTime) {
      setLessonTime(savedTime);
      setIsFirstTime(false);
      onTimeSelected(savedTime);
    }
  }, [onTimeSelected]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLessonTime(e.target.value);
  };

  const handleTimeSubmit = () => {
    // Сохраняем выбранное время для текущего дня
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`lesson_start_time_${today}`, lessonTime);
    
    onTimeSelected(lessonTime);
    setIsFirstTime(false);
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
