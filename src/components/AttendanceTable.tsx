import React, { useState, useMemo } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ViewType, getDatesForView, getLastTwelveMonths, exportToExcel } from "@/utils/attendanceUtils";
import { useAttendanceSync } from '@/hooks/useAttendanceSync';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AttendanceTable = () => {
  const { students, attendance, addStudent, removeStudent, updateAttendance } = useAttendanceSync();
  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `2024-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const dates = getDatesForView(viewType, selectedMonth);
  const months = getLastTwelveMonths();

  const handleAttendanceChange = (studentId: string, date: string, checked: boolean) => {
    updateAttendance(studentId, date, checked);
  };

  const handleAddStudent = () => {
    const name = prompt('Введите имя студента:');
    if (name) {
      addStudent(name);
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    removeStudent(studentId);
  };

  const handleExport = () => {
    exportToExcel(students, dates, attendance);
  };

  const missingStudents = useMemo(() => {
    if (viewType !== 'day' || dates.length === 0) return [];
    
    const currentDate = dates[0];
    return students.filter(student => !attendance[student.id]?.[currentDate]);
  }, [students, attendance, dates, viewType]);

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
            <div className="flex space-x-2">
              <Button className="flex-1 sm:flex-none" variant="outline" onClick={handleExport}>
                Экспорт
              </Button>
              <Button className="flex-1 sm:flex-none" variant="outline" onClick={handleAddStudent}>
                Добавить студента
              </Button>
            </div>
          </div>
        </div>

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
                      {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric' })}
                    </th>
                  ))}
                  <th className="border-b px-4 py-3 text-center text-sm font-semibold text-slate-800 min-w-[80px]">
                    Действия
                  </th>
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
                            checked={attendance[student.id]?.[date] || false}
                            onCheckedChange={(checked) => 
                              handleAttendanceChange(student.id, date, checked as boolean)
                            }
                            className="data-[state=checked]:animate-checkbox-check"
                          />
                        </div>
                      </td>
                    ))}
                    <td className="border-b px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Удалить
                      </button>
                    </td>
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
                  <div key={student.id} className="text-sm text-slate-800 p-2 bg-gray-50 rounded">
                    {student.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;