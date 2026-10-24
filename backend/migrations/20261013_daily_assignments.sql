CREATE TABLE assignments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id      VARCHAR(10) NOT NULL,
  grade           VARCHAR(20) NOT NULL,
  section         VARCHAR(50) NOT NULL,
  title           VARCHAR(160) NOT NULL,
  subject         VARCHAR(100) NOT NULL,
  description     TEXT NOT NULL,
  assignment_date DATE NOT NULL,
  due_date        DATE NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assignments_class_date (grade, section, assignment_date),
  CONSTRAINT fk_assignments_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB;