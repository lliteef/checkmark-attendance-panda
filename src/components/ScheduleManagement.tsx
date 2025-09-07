import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, BookOpen, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  name: string;
  teacher: string;
  room: string;
}

interface ScheduleItem {
  id: string;
  day_of_week: number;
  lesson_number: number;
  week_type: 'all' | 'numerator' | 'denominator';
  lesson: Lesson;
}

interface Group {
  id: string;
  name: string;
}

const ScheduleManagement = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const { toast } = useToast();

  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const weekTypes = [
    { value: 'all', label: 'Все недели' },
    { value: 'numerator', label: 'Числитель' },
    { value: 'denominator', label: 'Знаменатель' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchScheduleItems();
    }
  }, [selectedGroup]);

  const fetchData = async () => {
    try {
      const [lessonsResult, groupsResult] = await Promise.all([
        supabase.from('schedule_lessons').select('*').order('name'),
        supabase.from('schedule_groups').select('*').order('name')
      ]);

      if (lessonsResult.data) setLessons(lessonsResult.data);
      if (groupsResult.data) {
        setGroups(groupsResult.data);
        if (groupsResult.data.length > 0) {
          setSelectedGroup(groupsResult.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleItems = async () => {
    if (!selectedGroup) return;

    try {
      const { data: items } = await supabase
        .from('schedule_items')
        .select('id, day_of_week, lesson_number, week_type, lesson_id')
        .eq('group_id', selectedGroup);

      const { data: lessonData } = await supabase
        .from('schedule_lessons')
        .select('*');

      if (items && lessonData) {
        const lessonMap = new Map(lessonData.map(l => [l.id, l]));
        const itemsWithLessons = items.map(item => ({
          ...item,
          week_type: item.week_type as 'all' | 'numerator' | 'denominator',
          lesson: lessonMap.get(item.lesson_id)
        })).filter(item => item.lesson) as ScheduleItem[];

        setScheduleItems(itemsWithLessons);
      }
    } catch (error) {
      console.error('Error fetching schedule items:', error);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const lessonData = {
      name: formData.get('name') as string,
      teacher: formData.get('teacher') as string,
      room: formData.get('room') as string,
    };

    try {
      if (editingLesson) {
        await supabase
          .from('schedule_lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);
        
        toast({
          title: "Успешно",
          description: "Предмет обновлен"
        });
      } else {
        await supabase
          .from('schedule_lessons')
          .insert(lessonData);
        
        toast({
          title: "Успешно",
          description: "Предмет добавлен"
        });
      }

      fetchData();
      setLessonDialogOpen(false);
      setEditingLesson(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить предмет",
        variant: "destructive"
      });
    }
  };

  const handleSaveScheduleItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      group_id: selectedGroup,
      lesson_id: formData.get('lesson_id') as string,
      day_of_week: parseInt(formData.get('day_of_week') as string),
      lesson_number: parseInt(formData.get('lesson_number') as string),
      week_type: formData.get('week_type') as string,
    };

    try {
      if (editingItem) {
        await supabase
          .from('schedule_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        toast({
          title: "Успешно",
          description: "Занятие обновлено"
        });
      } else {
        await supabase
          .from('schedule_items')
          .insert(itemData);
        
        toast({
          title: "Успешно",
          description: "Занятие добавлено"
        });
      }

      fetchScheduleItems();
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить занятие",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      await supabase.from('schedule_lessons').delete().eq('id', id);
      toast({
        title: "Успешно",
        description: "Предмет удален"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить предмет",
        variant: "destructive"
      });
    }
  };

  const handleDeleteScheduleItem = async (id: string) => {
    try {
      await supabase.from('schedule_items').delete().eq('id', id);
      toast({
        title: "Успешно",
        description: "Занятие удалено"
      });
      fetchScheduleItems();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить занятие",
        variant: "destructive"
      });
    }
  };

  const getWeekTypeLabel = (weekType: string) => {
    return weekTypes.find(wt => wt.value === weekType)?.label || weekType;
  };

  const getWeekTypeBadgeVariant = (weekType: string) => {
    switch (weekType) {
      case 'numerator': return 'default';
      case 'denominator': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <Tabs defaultValue="schedule" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="schedule" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Расписание
        </TabsTrigger>
        <TabsTrigger value="lessons" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Предметы
        </TabsTrigger>
      </TabsList>

      <TabsContent value="schedule" className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Label htmlFor="group-select">Группа:</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить занятие
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Редактировать' : 'Добавить'} занятие</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveScheduleItem} className="space-y-4">
                <div>
                  <Label htmlFor="lesson_id">Предмет</Label>
                  <Select name="lesson_id" defaultValue={editingItem?.lesson.id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите предмет" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map(lesson => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="day_of_week">День недели</Label>
                  <Select name="day_of_week" defaultValue={editingItem?.day_of_week.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите день" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          {dayNames[day]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lesson_number">Номер пары</Label>
                  <Select name="lesson_number" defaultValue={editingItem?.lesson_number.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите номер пары" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num === 0 ? 'Разговоры о важном' : `${num} пара`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="week_type">Тип недели</Label>
                  <Select name="week_type" defaultValue={editingItem?.week_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип недели" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Обновить' : 'Добавить'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(day => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-lg">{dayNames[day]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scheduleItems
                    .filter(item => item.day_of_week === day)
                    .sort((a, b) => a.lesson_number - b.lesson_number)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {item.lesson_number === 0 ? 'Разговоры о важном' : `${item.lesson_number} пара`}
                            </span>
                            {item.week_type !== 'all' && (
                              <Badge variant={getWeekTypeBadgeVariant(item.week_type)}>
                                {getWeekTypeLabel(item.week_type)}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div className="font-medium">{item.lesson.name}</div>
                            <div>{item.lesson.teacher} • Кабинет: {item.lesson.room}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(item);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить занятие?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteScheduleItem(item.id)}>
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  {scheduleItems.filter(item => item.day_of_week === day).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      Нет занятий
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="lessons" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Управление предметами</h3>
          <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingLesson(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить предмет
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLesson ? 'Редактировать' : 'Добавить'} предмет</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveLesson} className="space-y-4">
                <div>
                  <Label htmlFor="name">Название предмета</Label>
                  <Input name="name" defaultValue={editingLesson?.name} required />
                </div>
                <div>
                  <Label htmlFor="teacher">Преподаватель</Label>
                  <Input name="teacher" defaultValue={editingLesson?.teacher} required />
                </div>
                <div>
                  <Label htmlFor="room">Кабинет</Label>
                  <Input name="room" defaultValue={editingLesson?.room} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setLessonDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">
                    {editingLesson ? 'Обновить' : 'Добавить'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {lessons.map(lesson => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{lesson.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {lesson.teacher} • Кабинет: {lesson.room}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingLesson(lesson);
                        setLessonDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить предмет?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие удалит предмет и все связанные с ним занятия в расписании.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ScheduleManagement;