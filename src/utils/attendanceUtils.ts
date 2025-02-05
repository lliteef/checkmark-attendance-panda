import * as XLSX from 'xlsx';

export type ViewType = "day" | "week" | "month";

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = воскресенье, 6 = суббота
};

const getNextMonday = (date: Date): string => {
  const nextMonday = new Date(date);
  while (nextMonday.getDay() !== 1) {
    nextMonday.setDate(nextMonday.getDate() + 1);
  }
  return nextMonday.toLocaleDateString('ru-RU', { 
    day: 'numeric',
    month: 'long'
  });
};

export const getDatesForView = (viewType: ViewType, selectedMonth: string): string[] => {
  const today = new Date();
  const [year, month] = selectedMonth.split('-').map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  switch (viewType) {
    case "day":
      return [today.toISOString().split('T')[0]];
    case "week": {
      const currentDate = new Date();
      const currentDay = currentDate.getDay();
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
      const currentDate = new Date(firstDayOfMonth);
      
      while (currentDate <= lastDayOfMonth) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday = 1, Friday = 5
          dates.push(new Date(currentDate).toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    }
    default:
      return [];
  }
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
