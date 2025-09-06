import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Trash2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StudentManagement from "@/components/StudentManagement";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await supabase
        .from('students')
        .select('id, name')
        .order('position');
      
      if (data) {
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Административная панель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Студенты
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Расписание
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Календарь
                </TabsTrigger>
                <TabsTrigger value="cleanup" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Очистка
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                {loading ? (
                  <div className="text-center py-8">Загрузка...</div>
                ) : (
                  <StudentManagement students={students} />
                )}
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление расписанием</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Здесь будет интерфейс для редактирования расписания
                    </p>
                    <Button disabled>
                      Функция в разработке
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление календарем</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Здесь будет интерфейс для редактирования календаря занятий
                    </p>
                    <Button disabled>
                      Функция в разработке
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cleanup" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Очистка старых данных</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Здесь будет функционал для очистки старых записей посещаемости
                    </p>
                    <Button disabled variant="destructive">
                      Функция в разработке
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;