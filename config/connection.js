require('dotenv').config();
const mysql = require('mysql2');



//create connection
const connection = mysql.createConnection({
    host: 'localhost',

    port: 3306,
    user:'root',
    multipleStatements: true
});


module.exports = connection;