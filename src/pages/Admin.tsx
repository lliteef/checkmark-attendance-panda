import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Calendar, ClipboardCheck, FileText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import StudentManagement from "@/components/StudentManagement";
import SessionManagement from "@/components/SessionManagement";
import AttendanceTable from "@/components/AttendanceTable";
import ScheduleManagement from "@/components/ScheduleManagement";
import DutyManagement from "@/components/DutyManagement";
import DocumentGenerator from "@/components/DocumentGenerator";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchStudents();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Выход выполнен успешно" });
      navigate('/');
    } catch (error) {
      toast({ title: "Ошибка при выходе", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Административная панель
              </CardTitle>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Студенты
                </TabsTrigger>
                <TabsTrigger value="session" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Сессия
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Посещаемость
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Расписание
                </TabsTrigger>
                <TabsTrigger value="duty" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Дежурство
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Документы
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                {loading ? (
                  <div className="text-center py-8">Загрузка...</div>
                ) : (
                  <StudentManagement students={students} />
                )}
              </TabsContent>

              <TabsContent value="session" className="mt-6">
                <SessionManagement />
              </TabsContent>

              <TabsContent value="attendance" className="mt-6">
                <AttendanceTable />
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <ScheduleManagement />
              </TabsContent>

              <TabsContent value="duty" className="mt-6">
                <DutyManagement />
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <DocumentGenerator />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;