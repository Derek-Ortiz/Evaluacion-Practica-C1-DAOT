INSERT INTO students (student_name, email, program, enrollment_year) VALUES
('Ana García', 'ana.garcia@email.com', 'Ingeniería en Sistemas', '2022-01-01'),
('Luis Martínez', 'luis.martinez@email.com', 'Licenciatura en Administración', '2021-01-01'),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', 'Medicina', '2023-01-01'),
('María López', 'maria.lopez@email.com', 'Derecho', '2020-01-01'),
('Sofía Fernández', 'sofia.fernandez@email.com', 'Psicología', '2022-01-01');

INSERT INTO teachers (teacher_name, email) VALUES
('Dr. Jorge Ramírez', 'jorge.ramirez@email.com'),
('Dra. Elena Torres', 'elena.torres@email.com'),
('Mtro. Ricardo Vargas', 'ricardo.vargas@email.com'),
('Mtra. Claudia Reyes', 'claudia.reyes@email.com'),
('Dr. Fernando Soto', 'fernando.soto@email.com');

INSERT INTO courses (code, course_name, credits) VALUES
('MAT101', 'Matemáticas Básicas', 5),
('FIS101', 'Física General', 6),
('PROG101', 'Programación I', 8),
('ADM101', 'Introducción a la Administración', 4),
('DER101', 'Derecho Civil I', 7);

INSERT INTO groups (course_id, teacher_id, term) VALUES
(1, 1, 'enero-abril'),
(2, 2, 'mayo-agosto'),
(3, 3, 'septiembre-diciembre'),
(4, 4, 'enero-abril'),
(5, 5, 'mayo-agosto');

INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(1, 1, '2024-01-15 09:00:00'),
(2, 2, '2024-05-20 10:30:00'),
(3, 3, '2024-09-10 08:45:00'),
(4, 4, '2024-01-12 14:20:00'),
(5, 5, '2024-05-18 11:10:00');

INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(1, 85.50, 90.00, 87.75),
(2, 78.00, 82.50, 80.25),
(3, 92.00, 88.50, 90.25),
(4, 65.00, 70.00, 67.50),
(5, 95.00, 93.50, 94.25);


INSERT INTO attendance (enrollment_id, attendance_date, present) VALUES
(1, '2024-01-16 08:00:00', TRUE),
(2, '2024-05-21 09:30:00', FALSE),
(3, '2024-09-11 10:15:00', TRUE),
(4, '2024-01-13 13:45:00', TRUE),
(5, '2024-05-19 11:00:00', FALSE);