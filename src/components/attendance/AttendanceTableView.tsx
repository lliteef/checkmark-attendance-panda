
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ViewType, getDayOfWeekName, isWeekend, getNextMonday } from "@/utils/attendanceUtils";

interface Student {
  id: string;
  name: string;
  position?: number;
}

interface AttendanceRecord {
  [key: string]: {
    [date: string]: {
      is_present: boolean;
      absence_reason?: string;
    };
  };
}

interface AttendanceTableViewProps {
  students: Student[];
  dates: string[];
  attendance: AttendanceRecord;
  viewType: ViewType;
  handleAttendanceChange: (studentId: string, date: string, checked: boolean) => void;
}

const AttendanceTableView: React.FC<AttendanceTableViewProps> = ({
  students,
  dates,
  attendance,
  viewType,
  handleAttendanceChange
}) => {
  const currentDate = dates[0];
  const isCurrentDateWeekend = currentDate && isWeekend(new Date(currentDate));

  if (isCurrentDateWeekend && viewType === 'day') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-lg text-slate-800">
            <p>Сегодня выходной день.</p>
            <p className="mt-2">Возвращайтесь {getNextMonday(new Date(currentDate))}!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
                  
                  return (
                    <td 
                      key={date} 
                      className={`border-b px-3 py-3 text-center ${
                        isWeekendDay ? 'bg-gray-100' : ''
                      }`}
                    >
                      {!isWeekendDay ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={attendance[student.id]?.[date]?.is_present || false}
                            onCheckedChange={(checked) => 
                              handleAttendanceChange(student.id, date, checked as boolean)
                            }
                            className="data-[state=checked]:animate-checkbox-check"
                          />
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
  );
};

export default AttendanceTableView;
