const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');


// Connect to database
const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: '',
        database: 'employees_db'
    },
    console.log(`Connected to the employee_db database.`)
);

const init = () => {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Please select from the following options:",
                name: "initialize",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role",
                    "I'm finished"
                ]
            }
        ]).then(ans => {
            // console.log(ans.initialize);
            switch (ans.initialize) {
                case "View all departments": viewDept();
                    break;
                case "View all roles": viewRole();
                    break;
                case "View all employees": viewEmployees();
                    break;
                case "Add a department": addDept();
                    break;
                case "Add a role": addRole();
                    break;
                case "Add an employee": addEmployee();
                    break;
                case "Update an employee role": updateEmployee();
                    break;
                case "I'm finished":
                    console.log("Thank you very much!");
                    process.exit();
            }
        }).catch(err => console.error(err));
}

init();

const viewDept = () => {
    // console.log("Working")
    db.query(`SELECT * FROM department`, (err, results) => {
        err ? console.error(err) : console.table(results);
        init();
    })
};

const viewRole = () => {
    db.query(`SELECT role.id, role.title, role.salary, CONCAT(department_name) AS department
    FROM role
    LEFT JOIN  department on role.department_id = department.id;`, (err, results) => {
        err ? console.error(err) : console.table(results);
        init();
    })
};

const viewEmployees = () => {
    db.query(`SELECT employees.id, employees.first_name, employees.last_name, role.title, department.department_name AS department, role.salary,  CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employees LEFT JOIN role ON employees.role_id = role.id LEFT JOIN  department on role.department_id = department.id LEFT JOIN employees manager ON manager.id = employees.manager_id`, (err, results) => {
        if (manager = null) {
            console.log("manager");
        }
        err ? console.error(err) : console.table(results);
        init();
    })
}

const addDept = () => {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the department you'd like to add?",
                name: "addDept"
            }
        ]).then(ans => {
            db.query(`INSERT INTO department(department_name)
                    VALUES(?)`, ans.addDept, (err, results) => {
                if (err) {
                    console.log(err)
                } else {
                    db.query(`SELECT * FROM department`, (err, results) => {
                        err ? console.error(err) : console.table(results);
                        init();
                    })
                }
            }
            )
        })
};

const addRole = () => {
    db.query('SELECT * FROM department', (err, department) => {
      if (err) { console.log(err) }
      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Name of role you wish to add:'
        },
        {
          type: 'number',
          name: 'salary',
          message: 'Salary for role:'
        },
        {
          type: 'list',
          name: 'departmentId',
          message: 'Department ID:',
          choices: department.map(department => ({
            name: department.department_name,
            value: department.id
          }))
        }
      ]).then(function (answers) {
        db.query('INSERT INTO role SET ?', {
          title: answers.title,
          salary: answers.salary,
          department_id: answers.departmentId
        }, function (err, res) {
          if (err) throw err;
          console.table(res)
          init();
        })
      })
    })
  }

const addEmployee = () => {
    // const rollChoices = () => db.promise().query(`SELECT * FROM roles`)
    // .then((rows) => {
    //     let arrNames = rows[0].map(obj => obj.name);
    //     return arrNames
    // })
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the employee's first name?",
                name: "firstName"
            },
            {
                type: "input",
                message: "What is the employee's last name?",
                name: "lastName"
            },
            // {
            //     type: "list",
            //     message: "What is the employee's role?",
            //     name: "employeeRole",
            //     choices: rollChoices
            // }
        ]).then(ans => {
            db.query(`INSERT INTO employees(first_name, last_name)
                    VALUES(?, ?)`, [ans.firstName, ans.lastName], (err, results) => {
                if (err) {
                    console.log(err)
                } else {
                    db.query(`SELECT * FROM employees`, (err, results) => {
                        err ? console.error(err) : console.table(results);
                        init();
                    })
                }
            }
            )
        })
}



const updateEmployee = () => {
    db.query('SELECT * FROM employees', (err, employees) => {
        if (err) {
            console.log(err);
            
        }
        db.query('SELECT * FROM role', (err, role) => {
            if (err) {
                console.log(err);
                
            }

            inquirer.prompt([
                {
                    type: "list",
                    name: "select employee",
                    message: "Select the employee whose role will be updated:",
                    choices: employees.map(employees => ({
                        name: `${employees.first_name} ${employees.last_name}`,
                        value: employees.id
                    }))
                },
                {
                    type: 'list',
                    name: 'updatedRole',
                    message: 'Select the new role:',
                    choices: role.map(role => ({
                        name: `${role.title}`,
                        value: role.id
                    }))
                }
            ]).then((answers) => {
                db.query('UPDATE employees SET ? WHERE ?', [{ role_id: answers.updatedRole }, { id: answers.selectEmp }], (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Employee role updated!');
                        init();
                    }
                    
                });
            });
        });
    });
};

    // inquirer
    //     .prompt([

    //         {
    //             type: "list",
    //             name: "employee",
    //             message: "Which employee would you like to update?",
    //             choices: ["Jean Smith", "Jeremy Piven", "Maria Gayle", "Elen Phillips",
    //                     "Henry Cole", "Raymond Stewart", "Kevin Skinner", "Romeo Singer", 
    //                     "Bret Morgan", "Angel Cruz", "Shawn King"]   
    //         },
    //         {
    //             type: 'list',
    //             name: 'newRole',
    //             message: 'What is their new role?',
    //             choices: ['Accountant', 'Senior Developer', 'Junior Developer', 'Lawyer', 
    //             'Sales Lead', 'Sales Person', 'Legal Team Lead', 'Head of Finance']
    //         },
    //     ])
// }