var db = require('./db-connector');

const ROLES = {
    DIRECTOR: 'director',
    MANAGER: 'manager',
    OPERATOR: 'operator',
    DRIVER: 'driver'
}

function addDriver(driverData, callback) {
    console.log("Adding new driver.");
    console.log("parameters: " + JSON.stringify(driverData));
    let query = 'START TRANSACTION;'
    query += 'SELECT @"role_id" := id FROM roles WHERE role = "' + ROLES.DRIVER + '";';
    query += 'SELECT * FROM accounts WHERE role = @role_id;';
    // query += 'INSERT INTO accounts(username, password, email, role, report) VALUES (?, "", ?, @role_id, ?);';
    // query += 'INSERT INTO employees VALUES (?, "", ?, ?, ?);';
    query += 'COMMIT;'
    db.connection.query(
        query,
        [driverData.username, driverData.email, driverData.report],
        function(error, results) {
            console.log("Error :");
            console.log(error);
            console.log("Results :");
            console.log(results);
            callback(results[2]);
        }
    );
}

module.exports = {
    addDriver: addDriver
}