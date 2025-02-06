import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttendanceSync } from '@/hooks/useAttendanceSync';
import { toast } from 'sonner';

const StudentManagement = () => {
  const { students, addStudent, removeStudent } = useAttendanceSync();
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('end');

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      toast.error('Введите имя студента');
      return;
    }

    try {
      const position = selectedPosition === 'end' 
        ? students.length 
        : parseInt(selectedPosition);
      
      await addStudent(newStudentName, position);
      setNewStudentName('');
      setSelectedPosition('end');
      toast.success('Студент добавлен');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Ошибка при добавлении студента');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await removeStudent(studentId);
      toast.success('Студент удален');
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Ошибка при удалении студента');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="text"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
          placeholder="Имя студента"
          className="flex-1"
        />
        <Select
          value={selectedPosition}
          onValueChange={setSelectedPosition}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Выберите позицию" />
          </SelectTrigger>
          <SelectContent>
            {students.map((_, index) => (
              <SelectItem key={index} value={index.toString()}>
                Позиция {index + 1}
              </SelectItem>
            ))}
            <SelectItem value="end">В конец списка</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddStudent}>
          Добавить
        </Button>
      </div>

      <div className="space-y-2">
        {students.map((student, index) => (
          <div key={student.id} className="flex items-center justify-between p-2 bg-white rounded-lg shadow">
            <span>{index + 1}. {student.name}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveStudent(student.id)}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentManagement;