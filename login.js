var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const databaseFunctions = require('./database-functions');
const dbConnector = require('./db-connector');

// config

const ROLES = {
    ADMIN : 1,
    MANAGER : 2,
    OPERATOR : 3,
    DRIVER : 4,
    DIRECTOR : 5
};

var app = express();
app.use(session({
    secret: 'thisissecret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// set public directory
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup

//set views directory
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// app

app.get('/', function(request, response) {
    // response.sendFile(path.join(__dirname + '/login.html'));
    response.render('pages/home');
});

app.post('/auth', function(request, response) {
    let username = request.body.inputUsername;
    let password = request.body.inputPassword;
    if (username && password) {
        dbConnector.connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedIn = true;
                request.session.username = username;
                request.session.loggedInUserId = results[0].id;
                request.session.role = results[0].role;
                console.log('logged in role: ' + results[0].role);
                switch (results[0].role) {
                    case ROLES.OPERATOR:
                        console.log("Operator logged in.");
                        response.redirect('/operator');
                        break;
                    case ROLES.DRIVER:
                        console.log("Driver logged in.");
                        response.redirect('/driver');
                        break;
                    case ROLES.MANAGER:
                        console.log("Manager logged in.");
                        response.redirect('/manager');
                        break;
                    default:
                        console.log("No idea who logged in.");
                        response.redirect('/home');
                }
            } else {
                response.send('Incorrect username/password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter username and password!');
        response.end();
    }
});

app.post('/driver/add', function(request, response) {
    let data = {
        username: request.body.username,
        email: request.body.email,
        report: request.session.loggedInUserId
    };
    console.log("call made to /driver/add");
    console.log(request.body);
    console.log("data package:");
    console.log(data);
    databaseFunctions.addDriver(data, function(results) {
        response.send(results);
        response.end();
    });
});

app.get('/operator', function(request, response) {
    console.log("Called get on /operator");
    let query = 'SELECT * FROM accounts WHERE report = ?';
    if (request.session.loggedIn) {
        dbConnector.connection.query(query, [request.session.loggedInUserId], function(error, results, fields) {
            console.log("Query made:");
            console.log(query);
            console.log("response:");
            console.log(results);
            let operatorDriverData = {};
            operatorDriverData.data = results;
            operatorDriverData.loggedInUserId = request.session.loggedInUserId;
            response.render('pages/operator', {data: operatorDriverData});
            response.end();
        });
    } else {
        response.send('Please login to view this page.');
        response.end();
    }
});

app.get('/driver', function(request, response) {
    if (request.session.loggedIn) {
        response.send('Welcome back driver ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page.');
    }
    response.end();
});

app.get('/manager', function(request, response) {
    if (request.session.loggedIn) {
        response.send('Welcome back manager ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page.');
    }
    response.end();
});

// start
app.listen(3000, function(request, response) {
    console.log('Server up and running - localhost:3000');
});