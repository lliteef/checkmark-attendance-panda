import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttendanceSync } from '@/hooks/useAttendanceSync';
import { Student } from '@/hooks/useAttendanceSync';
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface StudentManagementProps {
  students: Student[];
}

export const StudentManagement = ({ students }: StudentManagementProps) => {
  const { addStudent, removeStudent } = useAttendanceSync();
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<number>(students.length);

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      addStudent(newStudentName.trim(), selectedPosition);
      setNewStudentName('');
      toast.success('Студент добавлен');
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого студента?')) {
      removeStudent(studentId);
      toast.success('Студент удален');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {students.map((student, index) => (
          <div key={student.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="flex-1">{student.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveStudent(student.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Input
            placeholder="Имя нового студента"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
          />
          <Select
            value={String(selectedPosition)}
            onValueChange={(value) => setSelectedPosition(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите позицию" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: students.length + 1 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {i === 0 ? "В начало списка" : 
                   i === students.length ? "В конец списка" : 
                   `После ${students[i-1]?.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleAddStudent} 
          disabled={!newStudentName.trim()} 
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить студента
        </Button>
      </div>
    </div>
  );
};