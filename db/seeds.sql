-- Seeds database with information in tables
USE employees_db;

INSERT INTO department(department_name)
VALUES
("Sales"),
("Web Development"),
("Finance"), 
("Legal");

INSERT INTO role(title,salary, department_id)
VALUES
("Accountant", 120000, 3),
("Senior Developer", 160000, 2), 
("Junior Developer", 100000, 2), 
("Lawyer", 150000, 4), 
("Sales Lead", 90000, 1), 
("Salesperson", 70000, 1), 
("Legal Team Lead", 180000, 4), 
("Head of Finance", 220000, 3);

INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES 
("Jean", "Smith", 1, 11), 
("Jeremy", "Piven", 1, 11), 
("Maria", "Gayle", 3, 8), 
("Elen", "Phillips", 4, 10), 
("Henry", "Cole", 4, 10), 
("Raymond","Stewart", 6, 9), 
("Kevin", "Skinner", 3, 8);

INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES 
("Romeo", "Singer", 2, 8), 
("Bret", "Morgan", 5, 9),
("Angel", "Cruz", 7, 10), 
("Shawn", "King", 8, 11);