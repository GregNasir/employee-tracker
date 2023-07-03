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
            db.query(`INSERT INTO department(name)
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
    const deptChoices = () => db.promise().query(`SELECT * FROM department`)
        .then((rows) => {
            let arrNames = rows[0].map(obj => obj.name);
            return arrNames
        })
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the title of the role you'd like to add?",
                name: "roleTitle"
            },
            {
                type: "input",
                message: "What is the salary for this role?",
                name: "roleSalary"
            },
            {
                type: "list",
                message: "Which department is this role in?",
                name: "addDept",
                choices: deptChoices
            }
        ]).then(ans => {
            db.promise().query(`SELECT id FROM department WHERE name = ?`, ans.addDept)
                .then(answer => {
                    let mappedId = answer[0].map(obj => obj.id);
                    // console.log(mappedId[0])
                    return mappedId[0]
                })
                .then((mappedId) => {
                    db.promise().query(`INSERT INTO roles(title, salary, department_id)
                VALUES(?, ?, ?)`, [ans.roleTitle, ans.roleSalary, mappedId]);
                    init()
                })
        })
};

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
