-- Enable RLS on lesson_times table
ALTER TABLE public.lesson_times ENABLE ROW LEVEL SECURITY;

-- Create policies for lesson_times
CREATE POLICY "Enable read access for all users" 
ON public.lesson_times 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.lesson_times 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.lesson_times 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.lesson_times 
FOR DELETE 
USING (true);

-- Enable RLS on late_students table
ALTER TABLE public.late_students ENABLE ROW LEVEL SECURITY;

-- Create policies for late_students
CREATE POLICY "Enable read access for all users" 
ON public.late_students 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.late_students 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.late_students 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.late_students 
FOR DELETE 
USING (true);