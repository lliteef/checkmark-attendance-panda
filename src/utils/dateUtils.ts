
import { ViewType } from './viewUtils';

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = воскресенье, 6 = суббота
};

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
