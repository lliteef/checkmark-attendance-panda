
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useLateStudentsTracking = () => {
  useEffect(() => {
    // Add subscription to changes in the late_students table
    const lateStudentsChannel = supabase
      .channel('late_students_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'late_students' },
        (payload) => {
          console.log('Late students change received:', payload);
          // Updates will be handled by components that use this data
        }
      )
      .subscribe();

    // Add subscription to changes in the lesson_times table
    const lessonTimesChannel = supabase
      .channel('lesson_times_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_times' },
        (payload) => {
          console.log('Lesson times change received:', payload);
          // Updates will be handled by components that use this data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lateStudentsChannel);
      supabase.removeChannel(lessonTimesChannel);
    };
  }, []);

  // This hook only sets up listeners - it doesn't return any state
  // Components will fetch late students data directly when needed
  return {};
};
