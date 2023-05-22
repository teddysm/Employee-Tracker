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
    // MySQL username,
    user: "root",
    // TODO: Add MySQL password here
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
      choices: (await db.promise().query("SELECT title as role_title from role"))[0].map(obj=>{ return {name: obj.title, value:obj.id} }),
    },
  ])
  console.log(`UPDATE employee SET role = ${role} WHERE id=${manager}`)
  // init();
};


const employeePrompt = async() => {
  const response = await inquirer.prompt([
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

  const firstName = data.firstName
  const lastName = data.lastName
  const role = data.role;
  const manager = data.manager;
  db.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (${firstName}, ${lastName}, ${role}, ${manager})`);

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

  // inquirer.catch((error) => {
  //   console.log(error);
  // });
  
//  console.log(prompts);
  //console.log(prompts[2].choices[0]);

  await init();
};


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
        // console log error if exists
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
        // console log error if exists
        console.table(results);
        init();
      });
      break;
    case "5. Add Role":
      // add new role
      break;
    case "6. View All Department":
      // add new department
      break;
    case "7. Add Department":
      break;
    case "8. Quit":
      console.log("Thank you for using!");
      process.exit(0);
    default:
      console.log('Wrong option, please try again!')
  }
}

init();
