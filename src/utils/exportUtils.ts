
import * as XLSX from 'xlsx';
import { isWeekend } from './dateUtils';

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
