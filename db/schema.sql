CREATE TABLE students(
    id_student SERIAL PRIMARY KEY,
    student_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    program VARCHAR(100) NOT NULL,
    enrollment_year DATE NOT NULL
);

CREATE TABLE teachers(
    id_teacher SERIAL PRIMARY KEY,
    teacher_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE courses(
    id_course SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0)
);

CREATE TYPE term_period AS ENUM('enero-abril','mayo-agosto','septiembre-diciembre');

CREATE TABLE groups(
    id_group SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id_course) ON DELETE RESTRICT,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id_teacher) ON DELETE RESTRICT,
    term term_period NOT NULL
);

CREATE TABLE enrollments(
    id_enrollment SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id_student) ON DELETE RESTRICT,
    group_id INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE RESTRICT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(student_id,group_id)
);

CREATE TABLE grades(
    id_grade SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id_enrollment) ON DELETE RESTRICT,
    partial1 DECIMAL(10, 2) NOT NULL CHECK (partial1 >= 0),
    partial2 DECIMAL(10, 2) NOT NULL CHECK (partial2 >= 0),
    final DECIMAL(10,2) NOT NULL CHECK (partial2 >= 0)
);

CREATE TABLE attendance (
    id_attendance SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id_enrollment) ON DELETE RESTRICT,
    attendance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    present BOOLEAN DEFAULT FALSE,

    UNIQUE(enrollment_id, attendance_date)  
);