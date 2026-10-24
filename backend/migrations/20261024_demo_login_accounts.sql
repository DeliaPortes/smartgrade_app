-- Add the remaining teacher and parent demo accounts to an existing database.
-- The migration is safe to run again and skips existing email/role-linked accounts.
-- Demo password for these accounts: password123
INSERT INTO users (role,linked_id,email,password,name,phone,school)
SELECT demo.role, demo.linked_id, demo.email, demo.password, demo.name, demo.phone, NULL
FROM (
  SELECT 'teacher' AS role, 'T002' AS linked_id, 'preyes@tracked.edu' AS email,
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW' AS password,
    'Mr. Pedro Reyes' AS name, '09182222222' AS phone
  UNION ALL SELECT 'teacher', 'T003', 'clim@tracked.edu',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Ms. Carmen Lim', '09193333333'
  UNION ALL SELECT 'parent', 'P004', 'rsantos@gmail.com',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Mrs. Rosa Santos', '09204567890'
  UNION ALL SELECT 'parent', 'P005', 'alim@gmail.com',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Ms. Aileen Lim', '09215678901'
  UNION ALL SELECT 'parent', 'P006', 'btorres@gmail.com',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Mr. Bobby Torres', '09226789012'
  UNION ALL SELECT 'parent', 'P007', 'nramos@gmail.com',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Mrs. Nena Ramos', '09237890123'
  UNION ALL SELECT 'parent', 'P008', 'atan@gmail.com',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Mr. Anthony Tan', '09248901234'
  UNION ALL SELECT 'parent', 'P009', 'pcruz@gmail.com',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Mrs. Paz Cruz', '09259012345'
  UNION ALL SELECT 'parent', 'P010', 'lbautista@gmail.com',
    '$2b$12$ChuE8gTd93khXRVe/ClaluCJ8jwj6UOB/Tvp3YDhyvn0chVNqwqLW',
    'Mr. Leo Bautista', '09260123456'
) AS demo
WHERE NOT EXISTS (
  SELECT 1 FROM users existing
  WHERE existing.email = demo.email
     OR (existing.role = demo.role AND existing.linked_id = demo.linked_id)
);
