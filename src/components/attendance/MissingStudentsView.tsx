
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface MissingStudentsViewProps {
  missingStudents: Student[];
  attendance: AttendanceRecord;
  currentDate: string;
  onAbsenceReasonChange: (studentId: string, date: string, reason: string) => void;
}

const MissingStudentsView: React.FC<MissingStudentsViewProps> = ({
  missingStudents,
  attendance,
  currentDate,
  onAbsenceReasonChange
}) => {
  if (missingStudents.length === 0) {
    return null;
  }

  return (
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
                value={attendance[student.id]?.[currentDate]?.absence_reason || ''}
                onValueChange={(value) => onAbsenceReasonChange(student.id, currentDate, value)}
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
  );
};

export default MissingStudentsView;
