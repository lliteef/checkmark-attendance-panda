
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
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

interface LateStudentsViewProps {
  students: Student[];
  lateStudentIds: string[];
  attendance: AttendanceRecord;
  currentDate: string;
  onAbsenceReasonChange: (studentId: string, date: string, reason: string) => void;
}

const LateStudentsView: React.FC<LateStudentsViewProps> = ({
  students,
  lateStudentIds,
  attendance,
  currentDate,
  onAbsenceReasonChange
}) => {
  if (lateStudentIds.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 border-yellow-300">
      <CardHeader className="bg-yellow-50 border-b border-yellow-200">
        <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Опаздывающие студенты ({lateStudentIds.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-yellow-50/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {students
            .filter(student => lateStudentIds.includes(student.id))
            .map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded">
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

export default LateStudentsView;
