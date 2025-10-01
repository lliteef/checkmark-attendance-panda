import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { calculateDutyForDate } from "@/utils/dutyUtils";

interface DutyAssignment {
  student_name: string;
  is_substitute: boolean;
}

const DutyDisplay = () => {
  const [todayDuty, setTodayDuty] = useState<DutyAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayDuty();
  }, []);

  const loadTodayDuty = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if duty already assigned for today
    const { data: existingDuty, error: fetchError } = await supabase
      .from('duty_assignments')
      .select(`
        student_id,
        is_substitute,
        students (name)
      `)
      .eq('date', today);

    if (fetchError) {
      console.error('Error fetching duty:', fetchError);
      setLoading(false);
      return;
    }

    if (existingDuty && existingDuty.length > 0) {
      const assignments = existingDuty.map((item: any) => ({
        student_name: item.students?.name || 'Неизвестно',
        is_substitute: item.is_substitute
      }));
      setTodayDuty(assignments);
      setLoading(false);
      return;
    }

    // Calculate duty for today
    const result = await calculateDutyForDate(today);
    
    if (result && result.length > 0) {
      setTodayDuty(result.map(r => ({
        student_name: r.student_name,
        is_substitute: r.is_substitute
      })));
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Дежурство на сегодня
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Дежурство на сегодня
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayDuty.length === 0 ? (
          <p className="text-muted-foreground">Дежурные не назначены</p>
        ) : (
          <div className="space-y-2">
            {todayDuty.map((duty, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4" />
                <span className="font-medium">{duty.student_name}</span>
                {duty.is_substitute && (
                  <span className="text-xs text-muted-foreground">(замена)</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DutyDisplay;
