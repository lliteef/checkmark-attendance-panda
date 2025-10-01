import { supabase } from "@/integrations/supabase/client";

interface QueueItem {
  id: string;
  student_id: string;
  position: number;
  pair_group: number;
  student_name: string;
}

interface DutyResult {
  student_id: string;
  student_name: string;
  is_substitute: boolean;
}

export const calculateDutyForDate = async (date: string): Promise<DutyResult[]> => {
  // Get attendance for the date
  const { data: attendanceData } = await supabase
    .from('attendance_records')
    .select('student_id, is_present')
    .eq('date', date);

  const presentStudents = new Set(
    attendanceData?.filter(a => a.is_present).map(a => a.student_id) || []
  );

  // Get current queue
  const { data: queueData } = await supabase
    .from('duty_queue')
    .select(`
      id,
      student_id,
      position,
      pair_group,
      students (name)
    `)
    .order('position');

  if (!queueData || queueData.length === 0) {
    return [];
  }

  const queue: QueueItem[] = queueData.map((item: any) => ({
    id: item.id,
    student_id: item.student_id,
    position: item.position,
    pair_group: item.pair_group,
    student_name: item.students?.name || 'Неизвестно'
  }));

  // Group queue by pair_group
  const pairs: Record<number, QueueItem[]> = {};
  queue.forEach(item => {
    if (!pairs[item.pair_group]) pairs[item.pair_group] = [];
    pairs[item.pair_group].push(item);
  });

  const sortedPairGroups = Object.keys(pairs).map(Number).sort((a, b) => {
    const minPosA = Math.min(...pairs[a].map(p => p.position));
    const minPosB = Math.min(...pairs[b].map(p => p.position));
    return minPosA - minPosB;
  });

  let dutyStudents: DutyResult[] = [];
  let studentsToMoveToEnd: string[] = [];

  // Check first pair
  const firstPairGroup = sortedPairGroups[0];
  const firstPair = pairs[firstPairGroup];

  const firstPairPresent = firstPair.filter(s => presentStudents.has(s.student_id));

  if (firstPairPresent.length === 2) {
    // Scenario 1: Both present
    dutyStudents = firstPairPresent.map(s => ({
      student_id: s.student_id,
      student_name: s.student_name,
      is_substitute: false
    }));
    studentsToMoveToEnd = firstPair.map(s => s.student_id);
  } else if (firstPairPresent.length === 1) {
    // Scenario 2: One absent
    const presentOne = firstPairPresent[0];
    dutyStudents.push({
      student_id: presentOne.student_id,
      student_name: presentOne.student_name,
      is_substitute: false
    });
    studentsToMoveToEnd.push(presentOne.student_id);

    // Find first present from next pairs
    for (let i = 1; i < sortedPairGroups.length; i++) {
      const nextPair = pairs[sortedPairGroups[i]];
      const nextPresent = nextPair.find(s => presentStudents.has(s.student_id));
      if (nextPresent) {
        dutyStudents.push({
          student_id: nextPresent.student_id,
          student_name: nextPresent.student_name,
          is_substitute: true
        });
        studentsToMoveToEnd.push(nextPresent.student_id);
        break;
      }
    }
  } else {
    // Scenario 3: Both absent, find first full present pair
    for (let i = 1; i < sortedPairGroups.length; i++) {
      const nextPair = pairs[sortedPairGroups[i]];
      const nextPairPresent = nextPair.filter(s => presentStudents.has(s.student_id));
      
      if (nextPairPresent.length === 2) {
        dutyStudents = nextPairPresent.map(s => ({
          student_id: s.student_id,
          student_name: s.student_name,
          is_substitute: true
        }));
        studentsToMoveToEnd = nextPair.map(s => s.student_id);
        break;
      }
    }
  }

  // Save assignments to database
  if (dutyStudents.length > 0) {
    const assignments = dutyStudents.map(d => ({
      date,
      student_id: d.student_id,
      is_substitute: d.is_substitute
    }));

    await supabase.from('duty_assignments').insert(assignments);

    // Reorder queue: move assigned students to end
    if (studentsToMoveToEnd.length > 0) {
      const remainingQueue = queue.filter(q => !studentsToMoveToEnd.includes(q.student_id));
      const movedStudents = queue.filter(q => studentsToMoveToEnd.includes(q.student_id));

      const reorderedQueue = [...remainingQueue, ...movedStudents];

      for (let i = 0; i < reorderedQueue.length; i++) {
        await supabase
          .from('duty_queue')
          .update({ position: i + 1 })
          .eq('id', reorderedQueue[i].id);
      }
    }
  }

  return dutyStudents;
};

export const getDutyForDate = async (date: string): Promise<DutyResult[]> => {
  const { data } = await supabase
    .from('duty_assignments')
    .select(`
      student_id,
      is_substitute,
      students (name)
    `)
    .eq('date', date);

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((item: any) => ({
    student_id: item.student_id,
    student_name: item.students?.name || 'Неизвестно',
    is_substitute: item.is_substitute
  }));
};
