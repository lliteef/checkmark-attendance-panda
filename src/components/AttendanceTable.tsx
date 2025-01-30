import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ViewType, getDatesForView, getLastTwelveMonths, exportToExcel } from "@/utils/attendanceUtils";
import { useAttendanceSync } from '@/hooks/useAttendanceSync';

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
    const name = prompt('Enter student name:');
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
            <Button variant="outline" onClick={handleExport}>
              Export to Excel
            </Button>
            <Button variant="outline" onClick={handleAddStudent}>
              Add Student
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
                        onClick={() => handleRemoveStudent(student.id)}
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