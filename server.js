const inquirer = require("inquirer");
const mysql = require("mysql2");
const PORT = process.env.PORT || 3001;

const viewAllEmployees = `SELECT role.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,CONCAT(manager.first_name, " ", manager.last_name) AS manager
FROM employee 
INNER JOIN role 
ON employee.role_id = role.id
INNER JOIN department
ON role.department_id = department.id
LEFT JOIN employee AS manager
ON employee.manager_id = manager.id;`;

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "R00tR00t",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
);

const choices = [
  "1. View All Employees",
  "2. Add Employee",
  "3. Update Employee Role",
  "4. View All Role",
  "5. Add Role",
  "6. View All Department",
  "7. Add Department",
  "8. Quit",
];

const updateEmployeeRole = async() => {
  const response = await inquirer.prompt([
    {
      type: "list",
      message: "Which employee are we updating?",
      name: "employee",
      choices: (await db.promise().query("SELECT id, CONCAT(first_name, ' ', last_name) as employee from employee"))[0].map(obj=>{ return {name: obj.employee, value:obj.id} }),
    },
    {
      type: "list",
      message: "What is this employee's new role?",
      name: "role",
      choices: (await db.promise().query("SELECT id, title as role_title from role"))[0].map(obj=>{ return  {name: obj.role_title, value:obj.id} }),
    },
  ])

  db.query(`UPDATE employee SET role_id = ? WHERE id= ? `, [response.role, response.employee], (err, results) => {
    if (err) {
      console.log(err)
      return;
    }
    init();
  });

  console.log("Employee role successfully updated")
};


const employeePrompt = async() => {
  const data = await inquirer.prompt([
    {
      type: "input",
      message: "Employee's first name?",
      name: "firstName"
    },
    {
      type: "input",
      message: "Employee's last name?",
      name: "lastName"
    },
    {
      type: "list",
      message: "Employee's role?",
      choices: (await db.promise().query("SELECT id, title from role"))[0].map(obj=>{ return {name: obj.title, value:obj.id} }),
      name: "role"
    },
    {
      type: "list",
      message: "Employee's manager?",
      choices: (await db.promise().query("SELECT id, CONCAT(first_name, ' ', last_name) as manager FROM employee"))[0].map(obj=>{ return {name:obj.manager, value:obj.id} }),
      name: "manager"
    },
  ]);

  const firstName = data.firstName;
  const lastName = data.lastName;
  const role = data.role;
  const manager = data.manager;

  
  db.query('INSERT INTO employee SET first_name = ?, last_name = ?, role_id = ?, manager_id = ?', [firstName, lastName, role, manager], (err, results) => {
    if (err) {
      console.log(err)
      return;
    }
    init();
  });

  console.log("New employee successfully added!");
};


  // const prompts = [
  //   {
  //     type: "input",
  //     message: "Employee's first name?",
  //     name: "firstName"
  //   },
  //   {
  //     type: "input",
  //     message: "Employee's last name?",
  //     name: "lastName"
  //   },
  //   {
  //     type: "list",
  //     message: "Employee's role?",
  //     choices: (await db.promise().query("SELECT id, title from role"))[0].map(obj=>{ return {name: obj.title, value:obj.id} }),
  //     name: "role"
  //   },
  //   {
  //     type: "list",
  //     message: "Employee's manager?",
  //     choices: (await db.promise().query("SELECT id, CONCAT(first_name, ' ', last_name) as manager FROM employee"))[0].map(obj=>{ return {name:obj.manager, value:obj.id} }),
  //     name: "manager"
  //   },
  // ];

  // inquirer can take choices: [str,str,str...]
  // can also take choices [{name,value}, {name,value},...] where name is what's displayed to user
  // ... and value is what we handle in the app
  
  // inquirer.prompt(prompts).then(data=>{
  //   const firstName = data.firstName
  //   const lastName = data.lastName
  //   const role = data.role;
  //   const manager = data.manager;
  //   db.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (${firstName}, ${lastName}, ${role}, ${manager})`);
  // })






async function init() {
  console.log("Welcome to Employee Tracker.\n");
  // console.log("\nWhat would you like to do today?");
  const ui = new inquirer.ui.BottomBar();
  ui.log.write("-----------------------------------");
  const response = await inquirer.prompt([
    {
      type: "list",
      message: "What would you like to do? (Please use arrow keys)",
      choices: choices,
      name: "prompt",
    }
  ]);
  switch (response.prompt) {
    case "1. View All Employees":
      db.query(viewAllEmployees, (err, results) => {
        if (err) {
          console.log(err)
          return;
        }
        console.table(results);
        console.log("\n");
        init();
      });
      break;
    case "2. Add Employee":
      employeePrompt();
      break;
    case "3. Update Employee Role":
      updateEmployeeRole();
      break;
    case "4. View All Role":
      db.query("SELECT title FROM role", (err, results) => {
        if (err) {
          console.log(err)
          return;
        }
        console.table(results);
        init();
      });
      break;
    case "5. Add Role":
      // add new role
      const res = await inquirer.prompt([
        {
          type: "input",
          message: "What role would you like to add?",
          name: "role",
        },
        {
          type: "input",
          message: "What is the salary for this role?",
          name: "salary",
        },
        {
          type: "list",
          message: "Which department does this role belong to?",
          choices: (await db.promise().query("SELECT id, name from department"))[0].map(obj=>{ return {name: obj.name, value:obj.id} }),
          name: "department",
        },
      ]);
      db.query(`INSERT INTO role(title, department_id, salary) VALUES ("${res.role}", ${res.department}, ${res.salary})`, 
      (err, results) => {
        if (err) {
          console.log(err)
          return;
        }
        console.log("New role successfully added!");
        init();
      });
      break;
    case "6. View All Department":
      // add new department
      db.query("SELECT name FROM department", (err, results) => {
        if (err) {
          console.log(err)
          return;
        }
        console.table(results);
        init();
      });
      break;
    case "7. Add Department":
      // add a department
      const response = await inquirer.prompt([
        {
          type: "input",
          message: "What department would you like to add?",
          name: "dept",
        }
      ]);
      db.query(`INSERT INTO department(name) VALUE ("${response.dept}")`, (err, results) => {
        if (err) {
          console.log(err)
          return;
        }
        console.log("New department successfully added!");
        init();
      });
      break;
    case "8. Quit":
      console.log("Thank you for using Employee Tracker!");
      process.exit(0);
    default:
      console.log('Wrong option, please try again!')
  }
}

init();
