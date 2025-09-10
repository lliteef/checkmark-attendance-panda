-- Create session_items table for exams, tests, projects, and other forms
CREATE TABLE public.session_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name text NOT NULL,
  form_type text NOT NULL CHECK (form_type IN ('зачёт', 'экзамен', 'проект', 'другая форма')),
  teacher text NOT NULL,
  date date,
  time time without time zone,
  room text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create internships table for practice schedule
CREATE TABLE public.internships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('учебная', 'производственная')),
  hours integer NOT NULL,
  start_date date,
  end_date date,
  location text,
  supervisor text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

-- Create policies for session_items
CREATE POLICY "Enable read access for all users" ON public.session_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.session_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.session_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.session_items FOR DELETE USING (true);

-- Create policies for internships
CREATE POLICY "Enable read access for all users" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.internships FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.internships FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.internships FOR DELETE USING (true);