-- Add foreign key constraints to establish proper relationships
ALTER TABLE schedule_items 
ADD CONSTRAINT fk_schedule_items_group_id 
FOREIGN KEY (group_id) REFERENCES schedule_groups(id);

ALTER TABLE schedule_items 
ADD CONSTRAINT fk_schedule_items_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES schedule_lessons(id);

-- Add foreign key constraint for attendance records
ALTER TABLE attendance_records 
ADD CONSTRAINT fk_attendance_records_student_id 
FOREIGN KEY (student_id) REFERENCES students(id);

-- Add foreign key constraint for late students
ALTER TABLE late_students 
ADD CONSTRAINT fk_late_students_student_id 
FOREIGN KEY (student_id) REFERENCES students(id);