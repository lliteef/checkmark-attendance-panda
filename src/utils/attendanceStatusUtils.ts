
import { supabase } from "@/integrations/supabase/client";

// Проверка, является ли студент опоздавшим
export const isLate = async (
  studentId: string, 
  date: string, 
  attendance: Record<string, any>
): Promise<boolean> => {
  try {
    // Упрощаем код, используя однократное приведение типов
    type LateStudentRecord = { id: string };
    
    // Проверяем, отмечен ли студент как опоздавший в базе данных
    const { data: lateData, error: lateError } = await supabase
      .from('late_students')
      .select('id')
      .eq('student_id', studentId)
      .eq('date', date)
      .maybeSingle() as any;
    
    if (lateError) throw lateError;
    
    // Если студент уже в списке опоздавших в базе данных, то считаем его опоздавшим
    if (lateData) {
      // Но если у студента есть причина отсутствия, то он не считается опоздавшим
      if (attendance[studentId]?.[date]?.absence_reason) {
        return false;
      }
      return true;
    }
    
    // Если записи для студента нет, то не считаем опозданием
    return false;
  } catch (error) {
    console.error("Ошибка при проверке опоздания:", error);
    return false;
  }
};

// Проверка синхронно, без обращения к базе данных
// Используется для быстрого отображения в интерфейсе
export const isLateSync = (
  studentId: string,
  date: string,
  attendance: Record<string, any>,
  knownLateStudents: string[]
): boolean => {
  // Если у студента есть причина отсутствия, то он не считается опоздавшим
  if (attendance[studentId]?.[date]?.absence_reason) {
    return false;
  }
  
  // Если студент уже в списке опоздавших
  if (knownLateStudents.includes(studentId)) {
    return true;
  }
  
  return false;
};
