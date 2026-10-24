ALTER TABLE attendance
  ADD COLUMN half_day INT NOT NULL DEFAULT 0 AFTER absent,
  ADD COLUMN tardy INT NOT NULL DEFAULT 0 AFTER half_day;

CREATE TABLE attendance_records (
  student_id VARCHAR(10) NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present','Absent','Half-day','Tardy','Late') NOT NULL,
  PRIMARY KEY (student_id, attendance_date),
  CONSTRAINT fk_attendance_records_student
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;