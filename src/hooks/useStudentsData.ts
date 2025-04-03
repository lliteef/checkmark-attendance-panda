
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Student {
  id: string;
  name: string;
  position?: number;
}

export const useStudentsData = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .order('created_at');

        if (studentsError) throw studentsError;

        const transformedStudents = studentsData.map((s, index) => ({
          id: s.id,
          name: s.name,
          position: index
        }));
        setStudents(transformedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Ошибка при загрузке данных студентов');
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const studentsChannel = supabase
      .channel('students_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          console.log('Students change received:', payload);
          supabase
            .from('students')
            .select('*')
            .order('created_at')
            .then(({ data, error }) => {
              if (error) {
                console.error('Error refreshing students:', error);
                return;
              }
              const transformedStudents = data.map((s, index) => ({
                id: s.id,
                name: s.name,
                position: index
              }));
              setStudents(transformedStudents);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
    };
  }, []);

  const addStudent = async (name: string, position: number = students.length) => {
    try {
      // Add new student
      const { data, error } = await supabase
        .from('students')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Ошибка при добавлении студента');
      throw error;
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Ошибка при удалении студента');
      throw error;
    }
  };

  return {
    students,
    addStudent,
    removeStudent
  };
};
