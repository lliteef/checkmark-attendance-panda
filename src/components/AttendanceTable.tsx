import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ViewType, getDatesForView, getLastTwelveMonths, exportToExcel } from "@/utils/attendanceUtils";

interface Student {
  id: string;
  name: string;
}

interface AttendanceRecord {
  [key: string]: {
    [date: string]: boolean;
  };
}

const AttendanceTable = () => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Агапова Марина' },
      { id: '2', name: 'Айвазян Жозефина' },
      { id: '3', name: 'Афатова Виктория' },
      { id: '4', name: 'Баранова Карина' },
      { id: '5', name: 'Булгина Варвара' },
      { id: '6', name: 'Булыгин Роман' },
      { id: '7', name: 'Гонтарюк Анастасия' },
      { id: '8', name: 'Дианова Карина' },
      { id: '9', name: 'Илясова Ирина' },
      { id: '10', name: 'Кабиров Абубакр' },
      { id: '11', name: 'Карпова Полина' },
      { id: '12', name: 'Медведев Данила' },
      { id: '13', name: 'Мелихова Евгения' },
      { id: '14', name: 'Мирзониджотов Моил' },
      { id: '15', name: 'Павлицына Анна' },
      { id: '16', name: 'Развезева Мирра' },
      { id: '17', name: 'Рахимова Алина' },
      { id: '18', name: 'Скворцова Анна' },
      { id: '19', name: 'Тимофеев Алексей' },
      { id: '20', name: 'Уласевич Анастасия' },
      { id: '21', name: 'Федосеев Данила' },
      { id: '22', name: 'Федько Святослав' },
      { id: '23', name: 'Холостенко Александр' },
      { id: '24', name: 'Челышева Виктория' },
      { id: '25', name: 'Черникова Алевтина' },
    ];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : {};
  });

  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `2024-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const dates = getDatesForView(viewType, selectedMonth);
  const months = getLastTwelveMonths();

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [students, attendance]);

  const handleAttendanceChange = (studentId: string, date: string, checked: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [date]: checked,
      },
    }));
    toast.success(`Attendance ${checked ? 'marked' : 'unmarked'}`);
  };

  const addStudent = () => {
    const name = prompt('Enter student name:');
    if (name) {
      const newStudent = {
        id: Date.now().toString(),
        name,
      };
      setStudents(prev => [...prev, newStudent]);
      toast.success('Student added successfully');
    }
  };

  const removeStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
    setAttendance(prev => {
      const newAttendance = { ...prev };
      delete newAttendance[studentId];
      return newAttendance;
    });
    toast.success('Student removed successfully');
  };

  const handleExport = () => {
    exportToExcel(students, dates, attendance);
    toast.success("Export feature coming soon!");
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Посещаемость 0941</h2>
            <Select
              value={viewType}
              onValueChange={(value: ViewType) => setViewType(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth}
              onValueChange={(value) => setSelectedMonth(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExport}
            >
              Export to Excel
            </Button>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b px-6 py-3 text-left text-sm font-semibold text-slate-800 sticky left-0 bg-gray-50 z-10">
                    Фамилия Имя
                  </th>
                  {dates.map(date => (
                    <th key={date} className="border-b px-6 py-3 text-center text-sm font-semibold text-slate-800">
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric' })}
                    </th>
                  ))}
                  <th className="border-b px-6 py-3 text-center text-sm font-semibold text-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border-b px-6 py-4 text-sm text-slate-800 sticky left-0 bg-white z-10">
                      {student.name}
                    </td>
                    {dates.map(date => (
                      <td key={date} className="border-b px-6 py-4 text-center">
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
                    <td className="border-b px-6 py-4 text-center">
                      <button
                        onClick={() => removeStudent(student.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;