
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewType, getLastTwelveMonths } from "@/utils/attendanceUtils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarCog, CalendarPlus, Users } from "lucide-react";
import { toast } from "sonner";
import StudentManagement from '../StudentManagement';
import { useIsMobile } from '@/hooks/use-mobile';

interface Student {
  id: string;
  name: string;
  position?: number;
}

interface AttendanceFiltersProps {
  viewType: ViewType;
  selectedMonth: string;
  onViewTypeChange: (value: ViewType) => void;
  onSelectedMonthChange: (value: string) => void;
  onExport: () => void;
  students: Student[];
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  viewType,
  selectedMonth,
  onViewTypeChange,
  onSelectedMonthChange,
  onExport,
  students
}) => {
  const [calendarDate, setCalendarDate] = React.useState<Date>();
  const isMobile = useIsMobile();
  const months = getLastTwelveMonths();

  const handleAddSpecialDay = (date: Date | undefined) => {
    if (date) {
      toast.success(`День ${date.toLocaleDateString('ru-RU')} добавлен в календарь`);
      setCalendarDate(undefined);
    }
  };

  return (
    <div className="flex flex-col space-y-4 mb-6 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
      <h2 className="text-2xl font-bold text-slate-800">Посещаемость 0941</h2>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Select
          value={viewType}
          onValueChange={(value: ViewType) => onViewTypeChange(value)}
        >
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Вид" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">День</SelectItem>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
          </SelectContent>
        </Select>
        {viewType === 'month' && (
          <Select
            value={selectedMonth}
            onValueChange={(value) => onSelectedMonthChange(value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Выберите месяц" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {!isMobile && (
          <div className="flex space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarCog className="h-4 w-4" />
                  Редактировать календарь
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Настройки календаря</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Рабочие дни</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'].map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox id={day} defaultChecked />
                            <label htmlFor={day} className="text-sm">
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Добавить день в календарь</h3>
                      <div className="space-y-4">
                        <Calendar
                          mode="single"
                          selected={calendarDate}
                          onSelect={setCalendarDate}
                          className="rounded-md border"
                        />
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={() => handleAddSpecialDay(calendarDate)}
                          disabled={!calendarDate}
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Добавить выбранный день
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Управление студентами
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Управление списком студентов</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <StudentManagement students={students} />
                </div>
              </SheetContent>
            </Sheet>
            <Button className="flex-1 sm:flex-none" variant="outline" onClick={onExport}>
              Экспорт
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceFilters;
