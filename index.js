// Dependencies
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

// Initializes app
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
                case "No more options":
                    console.log("Thank you!");
                    process.exit();
            }
        }).catch(err => console.error(err));
}

init();

// Function to view departments
const viewDept = () => {
    
    db.query(`SELECT * FROM department`, (err, results) => {
        err ? console.error(err) : console.table(results);
        init();
    })
};

// Function to veiw roles
const viewRole = () => {
    db.query(`SELECT role.id, role.title, role.salary, CONCAT(department_name) AS department
    FROM role
    LEFT JOIN  department on role.department_id = department.id;`, (err, results) => {
        err ? console.error(err) : console.table(results);
        init();
    })
};

// Function to view employees
const viewEmployees = () => {
    db.query(`SELECT employees.id, employees.first_name, employees.last_name, role.title, department.department_name AS department, role.salary,  CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employees LEFT JOIN role ON employees.role_id = role.id LEFT JOIN  department on role.department_id = department.id LEFT JOIN employees manager ON manager.id = employees.manager_id`, (err, results) => {
        if (manager = null) {
            console.log("manager");
        }
        err ? console.error(err) : console.table(results);
        init();
    })
}

// To add a department to database
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

// To add a role to database
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
                }, 
                function (err, res) {
                if (err) throw err;
                console.table(res)

                db.query(`SELECT role.id, role.title, role.salary, CONCAT(department_name) AS department
                FROM role
                LEFT JOIN  department on role.department_id = department.id;`, (err, results) => {
                    err ? console.error(err) : console.table(results);
                    init();
                })

                init();
            })
        })
        })
    }

    // Function to add a new employee
    const addEmployee = () => {
        db.query('SELECT * FROM role', (err, role) => {
            if (err) { 
                console.log(err);
                return;
            }
    
            db.query('SELECT * FROM employees', (err, employees) => {
                if (err) { 
                    console.log(err);
                    return;
                }
    
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
                        {
                            type: "list",
                            name: "roleId",
                            message: "What role will this employee be assigned?",
                            choices: role.map(role => ({
                                name: role.title,
                                value: role.id 
                            }))
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Name of manager:",
                            choices: employees.map(employees => ({
                                name: `${employees.first_name} ${employees.last_name}`,
                                value: employees.id
                            }))
                        }
                    ]).then(ans => {
                        db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id)
                            VALUES (?, ?, ?, ?)`, [ans.firstName, ans.lastName, ans.roleId, ans.managerId], (err, results) => {
                            if (err) {
                                console.log(err);
                            } else {
                                db.query(`SELECT employees.id, employees.first_name, employees.last_name, role.title, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employees LEFT JOIN role ON employees.role_id = role.id LEFT JOIN employees manager ON manager.id = employees.manager_id`, (err, results) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.table(results);
                                        init();
                                    }
                                });
                            }
                        });
                    });
            });
        });
    };
    
// Update employee information
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
                    name: "selectEmployee",
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
                db.query('UPDATE employees SET ? WHERE ?', [{ role_id: answers.updatedRole }, { id: answers.selectEmployee }], (err, res) => {
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

    