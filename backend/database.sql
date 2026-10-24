-- ════════════════════════════════════════════════════════════════════════
-- TrackEd — database.sql
-- Import this in phpMyAdmin (XAMPP) to create the database, tables, and
-- seed data that mirrors what the app currently ships with in-memory.
-- ════════════════════════════════════════════════════════════════════════


-- ── Teachers ────────────────────────────────────────────────────────────
CREATE TABLE teachers (
  id        VARCHAR(10) PRIMARY KEY,
  name      VARCHAR(150) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  phone     VARCHAR(20),
  grade     VARCHAR(20),
  section   VARCHAR(50),
  subjects  VARCHAR(100) DEFAULT 'All Subjects',
  status    ENUM('active','inactive') DEFAULT 'active',
  joined    DATE
) ENGINE=InnoDB;

-- ── Parents ─────────────────────────────────────────────────────────────
CREATE TABLE parents (
  id     VARCHAR(10) PRIMARY KEY,
  name   VARCHAR(150) NOT NULL,
  email  VARCHAR(150) NOT NULL UNIQUE,
  phone  VARCHAR(20)
) ENGINE=InnoDB;

-- ── Students ────────────────────────────────────────────────────────────
CREATE TABLE students (
  id            VARCHAR(10) PRIMARY KEY,
  lrn           VARCHAR(20),
  name          VARCHAR(150) NOT NULL,
  grade         VARCHAR(20),
  section       VARCHAR(50),
  gender        ENUM('M','F'),
  parent_name   VARCHAR(150),
  parent_email  VARCHAR(150),
  parent_id     VARCHAR(10),
  teacher_id    VARCHAR(10),
  contact       VARCHAR(20),
  status        ENUM('active','inactive','dropout') DEFAULT 'active',
  enrolled      DATE,
  FOREIGN KEY (parent_id)  REFERENCES parents(id)  ON DELETE SET NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Classes ─────────────────────────────────────────────────────────────
CREATE TABLE classes (
  id         VARCHAR(10) PRIMARY KEY,
  grade      VARCHAR(20),
  section    VARCHAR(50),
  teacher_id VARCHAR(10),
  year       VARCHAR(20),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Daily assignments ──────────────────────────────────────────────────
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
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Grades — one row per student/subject, 4 quarter scores ─────────────
CREATE TABLE grades (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(10) NOT NULL,
  subject    ENUM('math','science','english','filipino','gmrc','ap','writing','mapeh','makabansa','reading_literacy','language') NOT NULL,
  q1 INT DEFAULT 0, q2 INT DEFAULT 0, q3 INT DEFAULT 0, q4 INT DEFAULT 0,
  UNIQUE KEY uniq_student_subject (student_id, subject),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Attendance — running totals per student ─────────────────────────────
CREATE TABLE attendance (
  student_id VARCHAR(10) PRIMARY KEY,
  present INT DEFAULT 0, absent INT DEFAULT 0, half_day INT DEFAULT 0,
  tardy INT DEFAULT 0, late INT DEFAULT 0, total INT DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE attendance_records (
  student_id VARCHAR(10) NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present','Absent','Half-day','Tardy','Late') NOT NULL,
  PRIMARY KEY (student_id, attendance_date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Messages ────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  from_role  VARCHAR(20) NOT NULL,
  from_id    VARCHAR(20) NOT NULL,
  from_name  VARCHAR(150) NOT NULL,
  to_role    VARCHAR(20) NOT NULL,
  to_id      VARCHAR(20) NOT NULL,
  subject    VARCHAR(255),
  body       TEXT,
  date       DATE,
  time       VARCHAR(20),
  is_read    TINYINT(1) DEFAULT 0,
  student_id VARCHAR(10) NULL,
  thread_id  INT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Announcements ────────────────────────────────────────────────────────
CREATE TABLE announcements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  date        DATE,
  audience    ENUM('all','teacher','parent') DEFAULT 'all',
  author      VARCHAR(150),
  author_role VARCHAR(20),
  priority    ENUM('normal','high') DEFAULT 'normal'
) ENGINE=InnoDB;

-- ── Notifications ────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  title   VARCHAR(255),
  body    TEXT,
  time    VARCHAR(50),
  type    ENUM('normal','high','alert') DEFAULT 'normal',
  is_read TINYINT(1) DEFAULT 0,
  role    VARCHAR(20) DEFAULT 'all'
) ENGINE=InnoDB;

-- ── Pending teacher registrations (Sign Up → Admin approval) ────────────
CREATE TABLE pending_teachers (
  id           VARCHAR(10) PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  phone        VARCHAR(20),
  grade        VARCHAR(20),
  section      VARCHAR(50),
  password     VARCHAR(255) NOT NULL,
  applied_date DATE,
  status       ENUM('pending','approved','rejected') DEFAULT 'pending'
) ENGINE=InnoDB;

-- ── Users — login accounts for every role ───────────────────────────────
-- linked_id points at teachers.id / parents.id / or 'admin' depending on role.
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  role       ENUM('teacher','parent','admin') NOT NULL,
  linked_id  VARCHAR(10) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(150) NOT NULL,
  phone      VARCHAR(20),
  telegram_chat_id VARCHAR(64) NULL UNIQUE,
  telegram_link_code_hash CHAR(64) NULL,
  telegram_link_expires_at DATETIME NULL,
  avatar     TEXT NULL,
  school     VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Auth tokens — simple bearer-token session store ─────────────────────
CREATE TABLE auth_tokens (
  token      VARCHAR(64) PRIMARY KEY,
  user_id    INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
-- SEED DATA — mirrors the app's built-in demo data
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO teachers (id,name,email,phone,grade,section,subjects,status,joined) VALUES
('T001','Ms. Maria Santos','teacher@tracked.edu','09171111111','Grade 1','Sampaguita','All Subjects','active','2020-06-01'),
('T002','Mr. Pedro Reyes','preyes@tracked.edu','09182222222','Grade 2','Rosal','All Subjects','active','2019-06-01'),
('T003','Ms. Carmen Lim','clim@tracked.edu','09193333333','Grade 3','Gumamela','All Subjects','active','2021-06-01');

INSERT INTO parents (id,name,email,phone) VALUES
('P001','Mrs. Liza Reyes','lreyes@gmail.com','09171234567'),
('P002','Mr. Carlos Gomez','cgomez@gmail.com','09182345678'),
('P003','Mr. Juan Dela Cruz','parent@gmail.com','09193456789'),
('P004','Mrs. Rosa Santos','rsantos@gmail.com','09204567890'),
('P005','Ms. Aileen Lim','alim@gmail.com','09215678901'),
('P006','Mr. Bobby Torres','btorres@gmail.com','09226789012'),
('P007','Mrs. Nena Ramos','nramos@gmail.com','09237890123'),
('P008','Mr. Anthony Tan','atan@gmail.com','09248901234'),
('P009','Mrs. Paz Cruz','pcruz@gmail.com','09259012345'),
('P010','Mr. Leo Bautista','lbautista@gmail.com','09260123456');

INSERT INTO students (id,lrn,name,grade,section,gender,parent_name,parent_email,parent_id,teacher_id,contact,status,enrolled) VALUES
('S001','100200300001','Maria Reyes','Grade 1','Sampaguita','F','Mrs. Liza Reyes','lreyes@gmail.com','P001','T001','09171234567','active','2024-06-01'),
('S002','100200300002','Juan Gomez','Grade 1','Sampaguita','M','Mr. Carlos Gomez','cgomez@gmail.com','P002','T001','09182345678','active','2024-06-01'),
('S003','100200300003','Jose Dela Cruz Jr.','Grade 1','Sampaguita','M','Mr. Juan Dela Cruz','parent@gmail.com','P003','T001','09193456789','active','2024-06-01'),
('S004','100200300004','Ana Santos','Grade 2','Rosal','F','Mrs. Rosa Santos','rsantos@gmail.com','P004','T002','09204567890','active','2024-06-01'),
('S005','100200300005','Pedro Lim','Grade 2','Rosal','M','Ms. Aileen Lim','alim@gmail.com','P005','T002','09215678901','active','2024-06-01'),
('S006','100200300006','Sofia Torres','Grade 2','Rosal','F','Mr. Bobby Torres','btorres@gmail.com','P006','T002','09226789012','active','2024-06-01'),
('S007','100200300007','Carlo Ramos','Grade 3','Gumamela','M','Mrs. Nena Ramos','nramos@gmail.com','P007','T003','09237890123','active','2024-06-01'),
('S008','100200300008','Lisa Tan','Grade 3','Gumamela','F','Mr. Anthony Tan','atan@gmail.com','P008','T003','09248901234','active','2024-06-01'),
('S009','100200300009','Marco Cruz','Grade 3','Gumamela','M','Mrs. Paz Cruz','pcruz@gmail.com','P009','T003','09259012345','active','2024-06-01'),
('S010','100200300010','Nina Bautista','Grade 3','Gumamela','F','Mr. Leo Bautista','lbautista@gmail.com','P010','T003','09260123456','active','2024-06-01');

INSERT INTO classes (id,grade,section,teacher_id,year) VALUES
('C001','Grade 1','Sampaguita','T001','2024-2025'),
('C002','Grade 2','Rosal','T002','2024-2025'),
('C003','Grade 3','Gumamela','T003','2024-2025');

INSERT INTO grades (student_id,subject,q1,q2,q3,q4) VALUES
('S001','makabansa',88,85,89,87),('S001','math',88,92,85,90),('S001','gmrc',0,0,0,0),('S001','reading_literacy',85,88,82,87),('S001','language',92,94,90,93),
('S002','makabansa',78,80,81,82),('S002','math',78,82,80,84),('S002','gmrc',0,0,0,0),('S002','reading_literacy',76,79,78,80),('S002','language',80,82,78,83),
('S003','makabansa',91,93,90,94),('S003','math',95,97,93,96),('S003','gmrc',88,90,89,92),('S003','reading_literacy',90,93,88,92),('S003','language',85,87,84,88),
('S004','math',82,85,80,84),('S004','science',79,81,78,82),('S004','english',88,90,86,89),('S004','filipino',86,88,84,87),('S004','gmrc',0,0,0,0),('S004','ap',83,85,82,86),('S004','writing',0,0,0,0),
('S005','math',78,80,76,82),('S005','science',79,78,81,80),('S005','english',77,76,79,78),('S005','filipino',75,77,78,80),('S005','gmrc',0,0,0,0),('S005','ap',76,78,79,77),('S005','writing',0,0,0,0),
('S006','math',90,93,88,92),('S006','science',85,87,83,89),('S006','english',88,91,86,90),('S006','filipino',92,94,90,93),('S006','gmrc',0,0,0,0),('S006','ap',87,89,85,91),('S006','writing',0,0,0,0),
('S007','math',78,80,75,82),('S007','science',84,86,81,85),('S007','english',76,79,73,80),('S007','filipino',82,84,80,85),('S007','gmrc',0,0,0,0),('S007','ap',79,81,77,83),('S007','mapeh',0,0,0,0),
('S008','math',78,80,76,81),('S008','science',78,79,80,77),('S008','english',76,78,79,77),('S008','filipino',77,79,78,80),('S008','gmrc',0,0,0,0),('S008','ap',76,78,79,77),('S008','mapeh',0,0,0,0),
('S009','math',86,88,84,89),('S009','science',80,82,78,83),('S009','english',84,86,82,87),('S009','filipino',88,90,86,91),('S009','gmrc',0,0,0,0),('S009','ap',82,84,80,85),('S009','mapeh',0,0,0,0),
('S010','math',91,93,89,94),('S010','science',87,89,85,90),('S010','english',89,91,87,92),('S010','filipino',93,95,91,96),('S010','gmrc',0,0,0,0),('S010','ap',85,87,83,88),('S010','mapeh',0,0,0,0);

INSERT INTO attendance (student_id,present,absent,late,total) VALUES
('S001',42,2,1,45),('S002',40,3,2,45),('S003',44,1,0,45),('S004',41,2,2,45),('S005',38,5,2,45),
('S006',43,1,1,45),('S007',39,4,2,45),('S008',35,7,3,45),('S009',42,2,1,45),('S010',44,1,0,45);

INSERT INTO messages (from_role,from_id,from_name,to_role,to_id,subject,body,date,time,is_read,student_id,thread_id) VALUES
('parent','P003','Mr. Juan Dela Cruz','teacher','teacher','Concern about Math performance','Good day Ma''am Santos. I would like to ask about my son Jose Jr.''s performance in Math this quarter. He seems to be struggling with basic addition at home. Can we schedule a parent-teacher meeting this week? Thank you.','2025-01-20','09:30 AM',1,'S003',NULL),
('teacher','teacher','Ms. Maria Santos','parent','P003','Re: Concern about Math performance','Good day Mr. Dela Cruz! Thank you for reaching out. Jose Jr. is actually doing exceptionally well — he currently holds the highest Math score in Grade 1 at 95 this quarter! I would be happy to meet on Friday at 3:00 PM. Please confirm your availability.','2025-01-21','10:15 AM',1,'S003',1),
('admin','admin','Principal Roberto Cruz','teacher','teacher','Q3 Grade Submission Reminder','Dear Teachers, This is a reminder that Q3 grades must be submitted by January 31, 2025, 5:00 PM. Please ensure all student records are accurate and complete. Thank you.','2025-01-22','08:00 AM',0,NULL,NULL),
('parent','P004','Mrs. Rosa Santos','teacher','teacher','Scholarship Application – Progress Report Needed','Good morning Ma''am! We are applying for a scholarship for Ana and we need an updated official progress report. Could you please prepare this at your earliest convenience? We need it by January 28. Thank you very much!','2025-01-24','07:45 AM',0,'S004',NULL),
('teacher','teacher','Ms. Maria Santos','parent','P005','Attendance Alert: Pedro Lim','Dear Ms. Aileen Lim, I hope this message finds you well. I am writing to inform you that Pedro has been absent 5 times this month, which may affect his quarterly grades. Please let me know if there are any issues we can address together.','2025-01-23','02:00 PM',1,'S005',NULL);

INSERT INTO announcements (title,body,date,audience,author,author_role,priority) VALUES
('Q3 Report Cards Now Ready for Pickup','Grade 1, 2, and 3 report cards for the 3rd quarter are now available at the Registrar''s Office. Please bring a valid government-issued ID. Parents must sign the logbook upon claiming. Office hours: Monday to Friday, 8:00 AM to 5:00 PM.','2025-01-25','all','Principal Cruz','admin','high'),
('Parent-Teacher Conference – February 5, 2025','The quarterly Parent-Teacher Conference is scheduled on Wednesday, February 5, 2025 from 8:00 AM to 12:00 NN. All parents of Grade 1, 2, and 3 students are strongly encouraged to attend.','2025-01-24','all','Principal Cruz','admin','high'),
('Reading Program – Grade 1 and 2','All Grade 1 and 2 homeroom teachers must submit their students'' reading assessment results by January 30, 2025. Please use the approved format from the English Department.','2025-01-23','teacher','Principal Cruz','admin','normal'),
('No Classes – February 25 (EDSA People Power Anniversary)','There will be no classes on Tuesday, February 25, 2025 in observance of the EDSA People Power Revolution Anniversary, a national holiday. Regular classes will resume on Wednesday, February 26, 2025.','2025-01-22','all','Admin Office','admin','normal');

INSERT INTO notifications (title,body,time,type,is_read,role) VALUES
('Q4 grade submission due','All teachers must complete grade entry by Friday afternoon.','2h ago','high',0,'teacher'),
('New parent message received','A parent has sent a new message about student progress.','5h ago','normal',0,'teacher'),
('School news posted','New announcements are now available for all users.','1d ago','normal',0,'all');

-- Demo login accounts — password for ALL of these is: password123
-- (hash below is a real, verified bcrypt hash, compatible with PHP's password_verify())
INSERT INTO users (role,linked_id,email,password,name,phone,school) VALUES
('teacher','T001','teacher@tracked.edu','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Ms. Maria Santos','09171111111',NULL),
('teacher','T002','preyes@tracked.edu','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mr. Pedro Reyes','09182222222',NULL),
('teacher','T003','clim@tracked.edu','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Ms. Carmen Lim','09193333333',NULL),
('parent','P003','parent@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mr. Juan Dela Cruz',NULL,NULL),
('parent','P004','rsantos@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mrs. Rosa Santos','09204567890',NULL),
('parent','P005','alim@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Ms. Aileen Lim','09215678901',NULL),
('parent','P006','btorres@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mr. Bobby Torres','09226789012',NULL),
('parent','P007','nramos@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mrs. Nena Ramos','09237890123',NULL),
('parent','P008','atan@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mr. Anthony Tan','09248901234',NULL),
('parent','P009','pcruz@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mrs. Paz Cruz','09259012345',NULL),
('parent','P010','lbautista@gmail.com','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Mr. Leo Bautista','09260123456',NULL),
('admin','admin','admin@tracked.edu','$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW','Principal Roberto Cruz',NULL,'Polangui South Central School');
