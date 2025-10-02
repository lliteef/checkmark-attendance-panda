import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Calendar as CalendarIcon, Users, ClipboardCheck, Download } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
}

const DocumentGenerator = () => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('id, name')
      .order('position');
    
    if (data) {
      setStudents(data);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedStudents([]);
  };

  const generateAttendanceDocument = async () => {
    if (!selectedDate) {
      toast({ title: "Выберите дату", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: records } = await supabase
        .from('attendance_records')
        .select(`
          *,
          students (name)
        `)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      // Generate printable HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Посещаемость - ${format(selectedDate, 'dd.MM.yyyy', { locale: ru })}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .present { color: green; }
            .absent { color: red; }
          </style>
        </head>
        <body>
          <h1>Журнал посещаемости</h1>
          <p><strong>Дата:</strong> ${format(selectedDate, 'dd MMMM yyyy', { locale: ru })}</p>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Студент</th>
                <th>Статус</th>
                <th>Причина отсутствия</th>
              </tr>
            </thead>
            <tbody>
              ${records?.map((record: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${record.students?.name || 'Неизвестно'}</td>
                  <td class="${record.is_present ? 'present' : 'absent'}">
                    ${record.is_present ? 'Присутствует' : 'Отсутствует'}
                  </td>
                  <td>${record.absence_reason || '-'}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">Нет данных</td></tr>'}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }

      toast({ title: "Документ сформирован" });
    } catch (error) {
      toast({ title: "Ошибка создания документа", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateDutyDocument = async () => {
    if (!selectedDate) {
      toast({ title: "Выберите дату", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: assignments } = await supabase
        .from('duty_assignments')
        .select(`
          *,
          students (name)
        `)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Дежурство - ${format(selectedDate, 'dd.MM.yyyy', { locale: ru })}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { text-align: center; margin-bottom: 30px; }
            .duty-list { font-size: 18px; line-height: 2; }
            .date { text-align: center; margin-bottom: 20px; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>График дежурства</h1>
          <div class="date"><strong>${format(selectedDate, 'dd MMMM yyyy', { locale: ru })}</strong></div>
          <div class="duty-list">
            ${assignments?.map((a: any, index: number) => `
              <p><strong>${index + 1}.</strong> ${a.students?.name || 'Неизвестно'} ${a.is_substitute ? '(замена)' : ''}</p>
            `).join('') || '<p>Нет назначений</p>'}
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }

      toast({ title: "Документ сформирован" });
    } catch (error) {
      toast({ title: "Ошибка создания документа", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateStudentListDocument = () => {
    const selected = selectedStudents.length > 0
      ? students.filter(s => selectedStudents.includes(s.id))
      : students;

    if (selected.length === 0) {
      toast({ title: "Выберите студентов", variant: "destructive" });
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Список студентов</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>Список студентов</h1>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>ФИО</th>
              <th>Подпись</th>
            </tr>
          </thead>
          <tbody>
            ${selected.map((student, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }

    toast({ title: "Документ сформирован" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Генератор документов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Посещаемость
            </TabsTrigger>
            <TabsTrigger value="duty">
              <Users className="h-4 w-4 mr-2" />
              Дежурство
            </TabsTrigger>
            <TabsTrigger value="students">
              <FileText className="h-4 w-4 mr-2" />
              Списки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <div className="space-y-2">
              <Label>Выберите дату</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={generateAttendanceDocument} disabled={loading} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Сформировать журнал посещаемости
            </Button>
          </TabsContent>

          <TabsContent value="duty" className="space-y-4">
            <div className="space-y-2">
              <Label>Выберите дату</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: ru }) : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={generateDutyDocument} disabled={loading} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Сформировать график дежурства
            </Button>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Label>Выберите студентов</Label>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Выбрать всех
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Снять выбор
                  </Button>
                </div>
              </div>
              <div className="border rounded-md p-4 max-h-96 overflow-y-auto space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <Label
                      htmlFor={student.id}
                      className="cursor-pointer flex-1"
                    >
                      {student.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={generateStudentListDocument} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Сформировать список студентов
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentGenerator;
