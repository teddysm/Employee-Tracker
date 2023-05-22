-- show roles with salary
SELECT role.id, role.title, 
       role.salary, department.name 
FROM role INNER JOIN department 
ON role.department_id = department.id
ORDER BY role.id;

-- ascending and descending sort in mysql shell/mysql2 

SELECT role.id, employee.first_name, employee.last_name, role.title, department.name AS department, 
       role.salary,CONCAT(manager.first_name, " ", manager.last_name) AS manager
FROM employee 
INNER JOIN role 
ON employee.role_id = role.id
INNER JOIN department
ON role.department_id = department.id
LEFT JOIN employee AS manager
ON employee.manager_id = manager.id;