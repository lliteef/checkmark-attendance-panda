import * as XLSX from 'xlsx';

export type ViewType = "day" | "week" | "month";

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
      const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust for Monday start
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - diff);
      
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    }
    case "month": {
      const dates = [];
      for (let date = new Date(firstDayOfMonth); date <= lastDayOfMonth; date.setDate(date.getDate() + 1)) {
        dates.push(date.toISOString().split('T')[0]);
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
      ...dates.map(date => attendance[student.id]?.[date] ? '✓' : '')
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: -1 });
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Посещаемость');
  
  XLSX.writeFile(workbook, 'посещаемость.xlsx');
};