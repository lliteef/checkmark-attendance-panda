
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

export type ViewType = "day" | "week" | "month";

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = воскресенье, 6 = суббота
};

// Now we export this function
export const getNextMonday = (date: Date): string => {
  const nextMonday = new Date(date);
  while (nextMonday.getDay() !== 1) {
    nextMonday.setDate(nextMonday.getDate() + 1);
  }
  return nextMonday.toLocaleDateString('ru-RU', { 
    day: 'numeric',
    month: 'long'
  });
};

// Добавляем время начала занятий по умолчанию
export const getDefaultLessonStartTime = (): string => {
  return "08:30"; // Время по умолчанию - 8:30
};

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
      return true;
    }
    
    // Если записи для студента нет, то не считаем опозданием
    if (!attendance[studentId]) return false;
    
    const record = attendance[studentId][date];
    
    // Если записи нет вообще
    if (!record) return false;
    
    // Если у студента есть причина отсутствия (б, н, п), то он не опоздал, а отсутствует по причине
    if (record.absence_reason) return false;
    
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
  // Если студент уже в списке опоздавших
  if (knownLateStudents.includes(studentId)) {
    return true;
  }
  
  // Если записи для студента нет
  if (!attendance[studentId]) return false;
  
  const record = attendance[studentId][date];
  
  // Если записи нет вообще
  if (!record) return false;
  
  // Если у студента есть причина отсутствия (б, н, п), то он не опоздал
  if (record.absence_reason) return false;
  
  return false;
};

export const getDatesForView = (viewType: ViewType, selectedMonth: string): string[] => {
  const today = new Date();
  const [year, month] = selectedMonth.split('-').map(Number);
  
  // Create the first day of the selected month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  
  // Create the last day of the selected month by getting day 0 of the next month
  // This correctly gives us the last day of the current month
  const lastDayOfMonth = new Date(year, month, 0);

  switch (viewType) {
    case "day":
      return [today.toISOString().split('T')[0]];
    case "week": {
      const currentDate = new Date();
      const currentDay = currentDate.getDay();
      // Adjust to start from Monday (1) to Friday (5)
      const diff = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - diff);
      
      const dates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    }
    case "month": {
      const dates = [];
      const currentDate = new Date(year, month - 1, 1); // Start from the 1st day of the selected month
      
      while (currentDate.getMonth() === month - 1) { // Continue until we reach the next month
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    }
    default:
      return [];
  }
};

export const getDayOfWeekName = (dateString: string): string => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return daysOfWeek[dayOfWeek];
};

export const getLastTwelveMonths = () => {
  const months = [];
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  for (let i = 0; i < 12; i++) {
    let monthIndex = currentMonth - i;
    let year = currentYear;

    if (monthIndex < 0) {
      monthIndex += 12;
      year -= 1;
    }

    const monthValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    months.push({
      value: monthValue,
      label: `${monthNames[monthIndex]} ${year}`
    });
  }

  return months;
};

export const exportToExcel = (students: any[], dates: string[], attendance: any) => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Фамилия Имя', ...dates.map(date => new Date(date).toLocaleDateString('ru-RU'))]
  ]);

  students.forEach((student, index) => {
    const rowData = [
      student.name,
      ...dates.map(date => {
        const dateObj = new Date(date);
        if (isWeekend(dateObj)) {
          return 'в';
        }
        const record = attendance[student.id]?.[date];
        if (!record?.is_present) {
          return record?.absence_reason || 'н'; // If no reason specified, default to 'н'
        }
        return '✓';
      })
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: -1 });
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Посещаемость');
  
  XLSX.writeFile(workbook, 'посещаемость.xlsx');
};
