
import React, { useState, useMemo } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ViewType, getDatesForView, getLastTwelveMonths, exportToExcel } from "@/utils/attendanceUtils";
import { useAttendanceSync } from '@/hooks/useAttendanceSync';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarCog, CalendarPlus, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import StudentManagement from './StudentManagement';
import { useIsMobile } from '@/hooks/use-mobile';

// Функция для получения названия дня недели
const getDayOfWeekName = (dateString: string): string => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return daysOfWeek[dayOfWeek];
};

const AttendanceTable = () => {
  const { students, attendance, updateAttendance, updateAbsenceReason } = useAttendanceSync();
  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [calendarDate, setCalendarDate] = useState<Date>();
  const isMobile = useIsMobile();

  const dates = getDatesForView(viewType, selectedMonth);
  const months = getLastTwelveMonths();

  const isWeekend = (date: string): boolean => {
    const dateObj = new Date(date);
    const day = dateObj.getDay();
    return day === 0 || day === 6; // 0 = воскресенье, 6 = суббота
  };

  const getNextMonday = (date: string): string => {
    const dateObj = new Date(date);
    while (dateObj.getDay() !== 1) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    return dateObj.toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'long'
    });
  };

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

  const handleAddSpecialDay = (date: Date | undefined) => {
    if (date) {
      toast.success(`День ${date.toLocaleDateString('ru-RU')} добавлен в календарь`);
      setCalendarDate(undefined);
    }
  };

  const missingStudents = useMemo(() => {
    if (viewType !== 'day' || dates.length === 0) return [];
    
    const currentDate = dates[0];
    return students.filter(student => !attendance[student.id]?.[currentDate]?.is_present);
  }, [students, attendance, dates, viewType]);

  const currentDate = dates[0];
  const isCurrentDateWeekend = currentDate && isWeekend(currentDate);

  return (
    <div className="w-full">
      <div className="min-w-[320px]">
        <div className="flex flex-col space-y-4 mb-6 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-2xl font-bold text-slate-800">Посещаемость 0941</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Select
              value={viewType}
              onValueChange={(value: ViewType) => setViewType(value)}
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
                onValueChange={(value) => setSelectedMonth(value)}
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
                <Button className="flex-1 sm:flex-none" variant="outline" onClick={handleExport}>
                  Экспорт
                </Button>
              </div>
            )}
          </div>
        </div>

        {isCurrentDateWeekend && viewType === 'day' ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-lg text-slate-800">
                <p>Сегодня выходной день.</p>
                <p className="mt-2">Возвращайтесь {getNextMonday(currentDate)}!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-slate-800 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                        Фамилия Имя
                      </th>
                      {dates.map(date => (
                        <th key={date} className="border-b px-3 py-3 text-center text-sm font-semibold text-slate-800 min-w-[60px]">
                          <div>{new Date(date).toLocaleDateString('ru-RU', { day: 'numeric' })}</div>
                          <div className="text-xs text-gray-500">{getDayOfWeekName(date)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="border-b px-4 py-3 text-sm text-slate-800 sticky left-0 bg-white z-10 whitespace-nowrap">
                          {student.name}
                        </td>
                        {dates.map(date => (
                          <td key={date} className="border-b px-3 py-3 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={attendance[student.id]?.[date]?.is_present || false}
                                onCheckedChange={(checked) => 
                                  handleAttendanceChange(student.id, date, checked as boolean)
                                }
                                className="data-[state=checked]:animate-checkbox-check"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {viewType === 'day' && missingStudents.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-red-600">
                    Отсутствующие студенты ({missingStudents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {missingStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="text-sm text-slate-800">{student.name}</div>
                        <Select
                          value={attendance[student.id]?.[dates[0]]?.absence_reason || ''}
                          onValueChange={(value) => handleAbsenceReasonChange(student.id, dates[0], value)}
                        >
                          <SelectTrigger className="w-[60px] h-8">
                            <SelectValue placeholder="?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="б">б</SelectItem>
                            <SelectItem value="н">н</SelectItem>
                            <SelectItem value="п">п</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
