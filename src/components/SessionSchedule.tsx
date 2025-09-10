import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, FileText, Factory } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const SessionSchedule = () => {
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const getFormTypeBadgeVariant = (formType: string) => {
    switch (formType) {
      case 'экзамен': return 'destructive';
      case 'зачёт': return 'default';
      case 'проект': return 'secondary';
      default: return 'outline';
    }
  };

  const getInternshipTypeBadgeVariant = (type: string) => {
    return type === 'производственная' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Расписание сессии и практик
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="session" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="session" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Сессия
              </TabsTrigger>
              <TabsTrigger value="internships" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Практики
              </TabsTrigger>
            </TabsList>

            <TabsContent value="session" className="mt-6">
              {sessionItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Пока нет запланированных форм контроля
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessionItems.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{item.subject_name}</CardTitle>
                          <Badge variant={getFormTypeBadgeVariant(item.form_type)}>
                            {item.form_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span><strong>Преподаватель:</strong> {item.teacher}</span>
                          </div>
                          {item.date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Дата:</strong> {new Date(item.date).toLocaleDateString('ru-RU')}</span>
                            </div>
                          )}
                          {item.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Время:</strong> {item.time}</span>
                            </div>
                          )}
                          {item.room && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Кабинет:</strong> {item.room}</span>
                            </div>
                          )}
                          {item.notes && (
                            <div className="mt-2 p-2 bg-muted rounded text-muted-foreground">
                              <strong>Примечания:</strong> {item.notes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="internships" className="mt-6">
              {internships.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Пока нет запланированных практик
                </div>
              ) : (
                <div className="grid gap-4">
                  {internships.map((internship) => (
                    <Card key={internship.id} className="border-l-4 border-l-secondary">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{internship.name}</CardTitle>
                          <Badge variant={getInternshipTypeBadgeVariant(internship.type)}>
                            {internship.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span><strong>Количество часов:</strong> {internship.hours}</span>
                          </div>
                          {internship.start_date && internship.end_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                <strong>Период:</strong> {new Date(internship.start_date).toLocaleDateString('ru-RU')} - {new Date(internship.end_date).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          )}
                          {internship.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Место прохождения:</strong> {internship.location}</span>
                            </div>
                          )}
                          {internship.supervisor && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span><strong>Руководитель:</strong> {internship.supervisor}</span>
                            </div>
                          )}
                          {internship.notes && (
                            <div className="mt-2 p-2 bg-muted rounded text-muted-foreground">
                              <strong>Примечания:</strong> {internship.notes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionSchedule;