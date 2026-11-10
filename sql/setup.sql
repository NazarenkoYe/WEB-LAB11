CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    major VARCHAR(100) NOT NULL
);

INSERT INTO students (name, age, major)
VALUES
    ('John Doe', 20, 'Computer Science'),
    ('Jane Smith', 22, 'Mathematics'),
    ('Alice Johnson', 21, 'Physics'),
    ('Bob Brown', 23, 'Engineering');