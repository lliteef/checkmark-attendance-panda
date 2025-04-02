
export type ViewType = "day" | "week" | "month";

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
