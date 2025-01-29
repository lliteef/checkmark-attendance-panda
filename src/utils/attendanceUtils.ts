import * as XLSX from 'xlsx';

export type ViewType = "day" | "week" | "month";

export const getDatesForView = (viewType: ViewType, selectedMonth: string): string[] => {
  const [year, month] = selectedMonth.split('-').map(Number);
  const dates: string[] = [];
  const today = new Date();
  
  switch (viewType) {
    case "day":
      return [today.toISOString().split('T')[0]];
    
    case "week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    }
    
    case "month": {
      const date = new Date(2024, month - 1, 1); // Force 2024 as the year
      while (date.getMonth() === month - 1) {
        dates.push(date.toISOString().split('T')[0]);
        date.setDate(date.getDate() + 1);
      }
      return dates;
    }
  }
};

export const getLastTwelveMonths = () => {
  const months = [];
  const today = new Date(2024, new Date().getMonth(), 1); // Force 2024
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      value: monthStr,
      label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  }
  
  return months;
};

export const exportToExcel = (students: any[], dates: string[], attendance: any) => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Prepare data for export
  const data = [
    ['Student Name', ...dates.map(date => new Date(date).toLocaleDateString())],
    ...students.map(student => [
      student.name,
      ...dates.map(date => attendance[student.id]?.[date] ? '✓' : '')
    ])
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  
  // Save file
  XLSX.writeFile(wb, `attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
};