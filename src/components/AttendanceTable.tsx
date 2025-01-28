import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

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
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
      { id: '3', name: 'Bob Johnson' },
    ];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : {};
  });

  // Generate dates for the last 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

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

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Attendance Sheet</h2>
          <button
            onClick={addStudent}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Student
          </button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-6 py-3 text-left text-sm font-semibold text-slate-800">
                  Student Name
                </th>
                {dates.map(date => (
                  <th key={date} className="border-b px-6 py-3 text-center text-sm font-semibold text-slate-800">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                  <td className="border-b px-6 py-4 text-sm text-slate-800">
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
  );
};

export default AttendanceTable;