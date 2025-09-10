import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FileText, Factory } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SessionItem {
  id: string;
  subject_name: string;
  form_type: 'зачёт' | 'экзамен' | 'проект' | 'другая форма';
  teacher: string;
  date?: string;
  time?: string;
  room?: string;
  notes?: string;
}

interface Internship {
  id: string;
  name: string;
  type: 'учебная' | 'производственная';
  hours: number;
  start_date?: string;
  end_date?: string;
  location?: string;
  supervisor?: string;
  notes?: string;
}

const SessionManagement = () => {
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [editingSessionItem, setEditingSessionItem] = useState<SessionItem | null>(null);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [internshipDialogOpen, setInternshipDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionResponse, internshipsResponse] = await Promise.all([
        supabase.from('session_items').select('*').order('date', { ascending: true }),
        supabase.from('internships').select('*').order('start_date', { ascending: true })
      ]);

      if (sessionResponse.data) {
        setSessionItems(sessionResponse.data as SessionItem[]);
      }
      if (internshipsResponse.data) {
        setInternships(internshipsResponse.data as Internship[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSessionItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sessionItemData = {
      subject_name: formData.get('subject_name') as string,
      form_type: formData.get('form_type') as 'зачёт' | 'экзамен' | 'проект' | 'другая форма',
      teacher: formData.get('teacher') as string,
      date: formData.get('date') as string || null,
      time: formData.get('time') as string || null,
      room: formData.get('room') as string || null,
      notes: formData.get('notes') as string || null,
    };

    try {
      if (editingSessionItem) {
        await supabase
          .from('session_items')
          .update(sessionItemData)
          .eq('id', editingSessionItem.id);
        toast({ title: "Форма контроля обновлена" });
      } else {
        await supabase.from('session_items').insert([sessionItemData]);
        toast({ title: "Форма контроля добавлена" });
      }
      
      setEditingSessionItem(null);
      setSessionDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось сохранить форму контроля", variant: "destructive" });
    }
  };

  const handleInternshipSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const internshipData = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'учебная' | 'производственная',
      hours: parseInt(formData.get('hours') as string),
      start_date: formData.get('start_date') as string || null,
      end_date: formData.get('end_date') as string || null,
      location: formData.get('location') as string || null,
      supervisor: formData.get('supervisor') as string || null,
      notes: formData.get('notes') as string || null,
    };

    try {
      if (editingInternship) {
        await supabase
          .from('internships')
          .update(internshipData)
          .eq('id', editingInternship.id);
        toast({ title: "Практика обновлена" });
      } else {
        await supabase.from('internships').insert([internshipData]);
        toast({ title: "Практика добавлена" });
      }
      
      setEditingInternship(null);
      setInternshipDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось сохранить практику", variant: "destructive" });
    }
  };

  const deleteSessionItem = async (id: string) => {
    try {
      await supabase.from('session_items').delete().eq('id', id);
      toast({ title: "Форма контроля удалена" });
      fetchData();
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить форму контроля", variant: "destructive" });
    }
  };

  const deleteInternship = async (id: string) => {
    try {
      await supabase.from('internships').delete().eq('id', id);
      toast({ title: "Практика удалена" });
      fetchData();
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить практику", variant: "destructive" });
    }
  };

  const SessionItemDialog = () => (
    <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setEditingSessionItem(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить форму контроля
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingSessionItem ? 'Редактировать форму контроля' : 'Добавить форму контроля'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSessionItemSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject_name">Предмет</Label>
            <Input 
              id="subject_name" 
              name="subject_name" 
              defaultValue={editingSessionItem?.subject_name} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="form_type">Форма контроля</Label>
            <Select name="form_type" defaultValue={editingSessionItem?.form_type} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите форму контроля" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="зачёт">Зачёт</SelectItem>
                <SelectItem value="экзамен">Экзамен</SelectItem>
                <SelectItem value="проект">Проект</SelectItem>
                <SelectItem value="другая форма">Другая форма</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="teacher">Преподаватель</Label>
            <Input 
              id="teacher" 
              name="teacher" 
              defaultValue={editingSessionItem?.teacher} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="date">Дата</Label>
            <Input 
              id="date" 
              name="date" 
              type="date" 
              defaultValue={editingSessionItem?.date} 
            />
          </div>
          <div>
            <Label htmlFor="time">Время</Label>
            <Input 
              id="time" 
              name="time" 
              type="time" 
              defaultValue={editingSessionItem?.time} 
            />
          </div>
          <div>
            <Label htmlFor="room">Кабинет</Label>
            <Input 
              id="room" 
              name="room" 
              defaultValue={editingSessionItem?.room} 
            />
          </div>
          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              defaultValue={editingSessionItem?.notes} 
            />
          </div>
          <Button type="submit" className="w-full">
            {editingSessionItem ? 'Обновить' : 'Добавить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  const InternshipDialog = () => (
    <Dialog open={internshipDialogOpen} onOpenChange={setInternshipDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setEditingInternship(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить практику
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingInternship ? 'Редактировать практику' : 'Добавить практику'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInternshipSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название практики</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={editingInternship?.name} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="type">Тип практики</Label>
            <Select name="type" defaultValue={editingInternship?.type} required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип практики" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="учебная">Учебная</SelectItem>
                <SelectItem value="производственная">Производственная</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hours">Количество часов</Label>
            <Input 
              id="hours" 
              name="hours" 
              type="number" 
              defaultValue={editingInternship?.hours} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="start_date">Дата начала</Label>
            <Input 
              id="start_date" 
              name="start_date" 
              type="date" 
              defaultValue={editingInternship?.start_date} 
            />
          </div>
          <div>
            <Label htmlFor="end_date">Дата окончания</Label>
            <Input 
              id="end_date" 
              name="end_date" 
              type="date" 
              defaultValue={editingInternship?.end_date} 
            />
          </div>
          <div>
            <Label htmlFor="location">Место прохождения</Label>
            <Input 
              id="location" 
              name="location" 
              defaultValue={editingInternship?.location} 
            />
          </div>
          <div>
            <Label htmlFor="supervisor">Руководитель</Label>
            <Input 
              id="supervisor" 
              name="supervisor" 
              defaultValue={editingInternship?.supervisor} 
            />
          </div>
          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              defaultValue={editingInternship?.notes} 
            />
          </div>
          <Button type="submit" className="w-full">
            {editingInternship ? 'Обновить' : 'Добавить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <Tabs defaultValue="session" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="session" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Формы контроля
        </TabsTrigger>
        <TabsTrigger value="internships" className="flex items-center gap-2">
          <Factory className="h-4 w-4" />
          Практики
        </TabsTrigger>
      </TabsList>

      <TabsContent value="session">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Управление формами контроля</CardTitle>
              <SessionItemDialog />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Предмет</TableHead>
                  <TableHead>Форма</TableHead>
                  <TableHead>Преподаватель</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.subject_name}</TableCell>
                    <TableCell>{item.form_type}</TableCell>
                    <TableCell>{item.teacher}</TableCell>
                    <TableCell>
                      {item.date ? new Date(item.date).toLocaleDateString('ru-RU') : '-'}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSessionItem(item);
                          setSessionDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSessionItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="internships">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Управление практиками</CardTitle>
              <InternshipDialog />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Часы</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell>{internship.name}</TableCell>
                    <TableCell>{internship.type}</TableCell>
                    <TableCell>{internship.hours}</TableCell>
                    <TableCell>
                      {internship.start_date && internship.end_date 
                        ? `${new Date(internship.start_date).toLocaleDateString('ru-RU')} - ${new Date(internship.end_date).toLocaleDateString('ru-RU')}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingInternship(internship);
                          setInternshipDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteInternship(internship.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SessionManagement;