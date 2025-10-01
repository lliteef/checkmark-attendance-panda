import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewType, getDatesForView, getLastTwelveMonths, getDayOfWeekName, isWeekend } from "@/utils/attendanceUtils";
import { useAttendanceSync } from '@/hooks/useAttendanceSync';
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const AttendanceView = () => {
  const { students, attendance } = useAttendanceSync();
  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const dates = getDatesForView(viewType, selectedMonth);
  const months = getLastTwelveMonths();

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

  const currentDate = dates[0];
  const isCurrentDateWeekend = currentDate && isWeekend(new Date(currentDate));

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
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b px-4 py-3 text-left text-sm font-semibold text-slate-800 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                      Фамилия Имя
                    </th>
                    {dates.map(date => {
                      const dateObj = new Date(date);
                      const day = dateObj.getDate();
                      const dayName = getDayOfWeekName(date);
                      const isWeekendDay = isWeekend(dateObj);
                      
                      return (
                        <th 
                          key={date} 
                          className={`border-b px-3 py-3 text-center text-sm font-semibold min-w-[60px] ${
                            isWeekendDay ? 'bg-gray-100 text-gray-400' : 'text-slate-800'
                          }`}
                        >
                          <div>{day}</div>
                          <div className={`text-xs ${isWeekendDay ? 'text-gray-400' : 'text-gray-500'}`}>
                            {dayName}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3 text-sm text-slate-800 sticky left-0 bg-white z-10 whitespace-nowrap">
                        {student.name}
                      </td>
                      {dates.map(date => {
                        const dateObj = new Date(date);
                        const isWeekendDay = isWeekend(dateObj);
                        const isPresent = attendance[student.id]?.[date]?.is_present;
                        
                        return (
                          <td 
                            key={date} 
                            className={`border-b px-3 py-3 text-center ${
                              isWeekendDay ? 'bg-gray-100' : ''
                            }`}
                          >
                            {!isWeekendDay ? (
                              <div className="flex justify-center">
                                {isPresent ? (
                                  <Check className="h-5 w-5 text-green-600" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">выходной</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;
