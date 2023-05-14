SELECT role.id, role.title, 
       role.salary, department.name 
FROM role INNER JOIN department 
ON role.department_id = department.id
ORDER BY role.id;

-- ascending and descending sort in mysql shell/mysql2 

SELECT role.id, employee.first_name, 
       employee.last_name, employee.manager_id 
FROM employee 
INNER JOIN role AS manager
ON employee.role_id = role.id
INNER JOIN employee
ON employee.manager_id = employee.id;