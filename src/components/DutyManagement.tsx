import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";

interface DutyQueueItem {
  id: string;
  student_id: string;
  position: number;
  pair_group: number;
  student_name: string;
}

const DutyManagement = () => {
  const [queue, setQueue] = useState<DutyQueueItem[]>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [pairGroup, setPairGroup] = useState<number>(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueue();
    fetchStudents();
  }, []);

  const fetchQueue = async () => {
    const { data: queueData, error } = await supabase
      .from('duty_queue')
      .select(`
        id,
        student_id,
        position,
        pair_group,
        students (name)
      `)
      .order('position');

    if (error) {
      toast({ title: "Ошибка загрузки очереди", variant: "destructive" });
      return;
    }

    const formattedQueue = queueData?.map((item: any) => ({
      id: item.id,
      student_id: item.student_id,
      position: item.position,
      pair_group: item.pair_group,
      student_name: item.students?.name || 'Неизвестно'
    })) || [];

    setQueue(formattedQueue);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('id, name')
      .order('name');
    
    if (data) setStudents(data);
  };

  const addToQueue = async () => {
    if (!selectedStudent) {
      toast({ title: "Выберите студента", variant: "destructive" });
      return;
    }

    const maxPosition = queue.length > 0 ? Math.max(...queue.map(q => q.position)) : 0;

    const { error } = await supabase
      .from('duty_queue')
      .insert({
        student_id: selectedStudent,
        position: maxPosition + 1,
        pair_group: pairGroup
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Этот студент уже в очереди", variant: "destructive" });
      } else {
        toast({ title: "Ошибка добавления", variant: "destructive" });
      }
      return;
    }

    toast({ title: "Студент добавлен в очередь" });
    fetchQueue();
    setSelectedStudent("");
  };

  const removeFromQueue = async (id: string) => {
    const { error } = await supabase
      .from('duty_queue')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
      return;
    }

    toast({ title: "Студент удален из очереди" });
    await reorderQueue();
  };

  const movePosition = async (currentPosition: number, direction: 'up' | 'down') => {
    const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1;
    const currentItem = queue.find(q => q.position === currentPosition);
    const swapItem = queue.find(q => q.position === newPosition);

    if (!currentItem || !swapItem) return;

    const { error: error1 } = await supabase
      .from('duty_queue')
      .update({ position: newPosition })
      .eq('id', currentItem.id);

    const { error: error2 } = await supabase
      .from('duty_queue')
      .update({ position: currentPosition })
      .eq('id', swapItem.id);

    if (error1 || error2) {
      toast({ title: "Ошибка изменения позиции", variant: "destructive" });
      return;
    }

    fetchQueue();
  };

  const reorderQueue = async () => {
    const { data } = await supabase
      .from('duty_queue')
      .select('id')
      .order('position');

    if (data) {
      for (let i = 0; i < data.length; i++) {
        await supabase
          .from('duty_queue')
          .update({ position: i + 1 })
          .eq('id', data[i].id);
      }
      fetchQueue();
    }
  };

  const initializeDefaultQueue = async () => {
    const defaultPairs = [
      ["Агапова Марина", "Айвазян Жозефина"],
      ["Афатова Виктория", "Баранова Карина"],
      ["Бондарев Константин", "Булгина Варвара"],
      ["Булыгин Роман", "Гонтарюк Анастасия"],
      ["Дианова Кристина", "Илясова Ирина"],
      ["Кабиров Абубакр", "Карпова Полина"],
      ["Медведев Данила", "Мелихова Евгения"],
      ["Мирзониджотов Моил", "Павлицына Анна"],
      ["Рахимова Алина", "Скворцова Анна"],
      ["Тимофеев Алексей", "Федосеев Данила"],
      ["Федько Святослав", "Холостенко Александр"],
      ["Челышева Виктория", "Черникова Алевтина"]
    ];

    let position = 1;
    for (let i = 0; i < defaultPairs.length; i++) {
      const pair = defaultPairs[i];
      for (const studentName of pair) {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .ilike('name', studentName)
          .single();

        if (studentData) {
          await supabase
            .from('duty_queue')
            .insert({
              student_id: studentData.id,
              position: position++,
              pair_group: i + 1
            });
        }
      }
    }

    toast({ title: "Очередь инициализирована" });
    fetchQueue();
  };

  const groupedQueue = queue.reduce((acc, item) => {
    if (!acc[item.pair_group]) acc[item.pair_group] = [];
    acc[item.pair_group].push(item);
    return acc;
  }, {} as Record<number, DutyQueueItem[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Управление очередью дежурств
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Студент</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите студента" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label>Пара №</Label>
              <Input
                type="number"
                min="1"
                value={pairGroup}
                onChange={(e) => setPairGroup(parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addToQueue}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
          </div>

          <Button onClick={initializeDefaultQueue} variant="outline" className="w-full">
            Инициализировать очередь по умолчанию
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущая очередь ({queue.length} студентов)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {Object.entries(groupedQueue).map(([group, items]) => (
                <div key={group} className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Пара {group}</div>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground w-8">#{item.position}</span>
                          <span>{item.student_name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => movePosition(item.position, 'up')}
                            disabled={item.position === 1}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => movePosition(item.position, 'down')}
                            disabled={item.position === queue.length}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromQueue(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DutyManagement;
