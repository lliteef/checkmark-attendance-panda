import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, ClipboardCheck, FileText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import StudentManagement from "@/components/StudentManagement";
import AttendanceTable from "@/components/AttendanceTable";
import DocumentGenerator from "@/components/DocumentGenerator";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
              <TabsList className="grid w-full grid-cols-3 overflow-x-auto">
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {!isMobile && "Студенты"}
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  {!isMobile && "Посещаемость"}
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {!isMobile && "Документы"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                {loading ? (
                  <div className="text-center py-8">Загрузка...</div>
                ) : (
                  <StudentManagement students={students} />
                )}
              </TabsContent>

              <TabsContent value="attendance" className="mt-6">
                <AttendanceTable />
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