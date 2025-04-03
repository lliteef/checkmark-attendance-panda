
import { useStudentsData, Student } from './useStudentsData';
import { useAttendanceData, AttendanceRecord } from './useAttendanceData';
import { useLateStudentsTracking } from './useLateStudentsTracking';

export type { Student, AttendanceRecord };

export const useAttendanceSync = () => {
  const { students, addStudent, removeStudent } = useStudentsData();
  const { attendance, updateAttendance, updateAbsenceReason } = useAttendanceData();
  
  // Set up late students tracking
  useLateStudentsTracking();

  return {
    students,
    attendance,
    addStudent,
    removeStudent,
    updateAttendance,
    updateAbsenceReason
  };
};
