-- Create schedule_groups table
CREATE TABLE public.schedule_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for schedule_groups
CREATE POLICY "Enable read access for all users" 
ON public.schedule_groups 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.schedule_groups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.schedule_groups 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.schedule_groups 
FOR DELETE 
USING (true);

-- Create schedule_lessons table
CREATE TABLE public.schedule_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher TEXT NOT NULL,
  room TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for schedule_lessons
CREATE POLICY "Enable read access for all users" 
ON public.schedule_lessons 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.schedule_lessons 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.schedule_lessons 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.schedule_lessons 
FOR DELETE 
USING (true);

-- Create schedule_items table
CREATE TABLE public.schedule_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  lesson_number INTEGER NOT NULL,
  week_type TEXT CHECK (week_type IN ('all', 'numerator', 'denominator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- Create policies for schedule_items
CREATE POLICY "Enable read access for all users" 
ON public.schedule_items 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.schedule_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.schedule_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.schedule_items 
FOR DELETE 
USING (true);

-- Insert group 0941
INSERT INTO public.schedule_groups (name) VALUES ('0941');

-- Insert lessons for group 0941
INSERT INTO public.schedule_lessons (name, teacher, room) VALUES 
('Разговоры о важном', 'Головина Е.Н.', '42'),
('Манипулирование данными и формирование запросов к базе данных', 'Рудукан М.А.', '25'),
('Обществознание', 'Чеснокова Н.Н.', '24'),
('Математика', 'Сусло Г.А.', '40'),
('География', 'Бутенко Е.С.', '48'),
('Основы управления работой веб-ресурсов', 'Рудукан М.А.', '25'),
('Основы финансовой грамотности', 'Залюбовская И.А.', '34'),
('Обществознание', 'Чеснокова Н.Н.', '42'),
('Английский язык', 'Матвеева Н.В.', '45'),
('Английский язык', 'Щукина И.Е.', '36'),
('Работа в системе управления контентом', 'Нагибин Т.С.', '25'),
('Физкультура', 'Семичаснова Е.В.', 'зал'),
('Биология', 'Карпачёва С.В.', '47'),
('Безопасность жизнедеятельности', 'Рачков А.С.', '32А');

-- Get the group ID for 0941
DO $$
DECLARE
    group_0941_id UUID;
    lesson_id UUID;
BEGIN
    SELECT id INTO group_0941_id FROM public.schedule_groups WHERE name = '0941';
    
    -- Monday schedule
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Разговоры о важном' AND teacher = 'Головина Е.Н.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 1, 0, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Манипулирование данными и формирование запросов к базе данных' AND teacher = 'Рудукан М.А.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 1, 1, 'all');
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 1, 2, 'all');
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 1, 3, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Обществознание' AND teacher = 'Чеснокова Н.Н.' AND room = '24' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 1, 4, 'numerator');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Математика' AND teacher = 'Сусло Г.А.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 1, 4, 'denominator');
    
    -- Tuesday schedule
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 2, 1, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'География' AND teacher = 'Бутенко Е.С.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 2, 2, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Основы управления работой веб-ресурсов' AND teacher = 'Рудукан М.А.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 2, 3, 'all');
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 2, 4, 'all');
    
    -- Wednesday schedule
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Основы финансовой грамотности' AND teacher = 'Залюбовская И.А.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 3, 2, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Обществознание' AND teacher = 'Чеснокова Н.Н.' AND room = '42' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 3, 3, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Английский язык' AND teacher = 'Матвеева Н.В.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 3, 4, 'numerator');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Английский язык' AND teacher = 'Щукина И.Е.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 3, 4, 'denominator');
    
    -- Thursday schedule
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Работа в системе управления контентом' AND teacher = 'Нагибин Т.С.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 4, 3, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Физкультура' AND teacher = 'Семичаснова Е.В.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 4, 4, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Биология' AND teacher = 'Карпачёва С.В.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 4, 5, 'all');
    
    -- Friday schedule
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Английский язык' AND teacher = 'Щукина И.Е.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 5, 1, 'denominator');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Безопасность жизнедеятельности' AND teacher = 'Рачков А.С.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 5, 2, 'all');
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 5, 3, 'all');
    
    SELECT id INTO lesson_id FROM public.schedule_lessons WHERE name = 'Английский язык' AND teacher = 'Матвеева Н.В.' LIMIT 1;
    INSERT INTO public.schedule_items (group_id, lesson_id, day_of_week, lesson_number, week_type) VALUES (group_0941_id, lesson_id, 5, 4, 'numerator');
END $$;