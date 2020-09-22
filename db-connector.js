var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    password: 'test',
    database: 'nodelogin',
    multipleStatements: true
});

connection.connect(function(err){
    if(!err) {
        console.log('Database is connected!');
    } else {
        console.log('Error connecting database!', err);
    }
});

module.exports = {
    connection : connection
}