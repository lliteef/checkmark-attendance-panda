-- Create duty queue table to store the order of students on duty
CREATE TABLE public.duty_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  pair_group INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Create duty assignments table to store who is on duty on specific dates
CREATE TABLE public.duty_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  is_substitute BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, student_id)
);

-- Enable Row Level Security
ALTER TABLE public.duty_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for duty_queue
CREATE POLICY "Enable read access for all users" 
ON public.duty_queue 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.duty_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.duty_queue 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.duty_queue 
FOR DELETE 
USING (true);

-- Create policies for duty_assignments
CREATE POLICY "Enable read access for all users" 
ON public.duty_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.duty_assignments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.duty_assignments 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.duty_assignments 
FOR DELETE 
USING (true);

-- Create index for better performance
CREATE INDEX idx_duty_queue_position ON public.duty_queue(position);
CREATE INDEX idx_duty_assignments_date ON public.duty_assignments(date);