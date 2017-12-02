const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8000;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(cors());

var dotenv = require('dotenv')
    .config({
        path: __dirname + '/.env'
    });

var mysql = require('mysql');
var fs = require('fs');
//nexmo

var Nexmo = require('nexmo');

var nexmo = new Nexmo({
    apiKey: process.env.NEXMO_KEY,
    apiSecret: process.env.NEXMO_SECRET,
});

//Multer

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/userAvatars/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + '.jpg')
    }
});
var upload = multer({
    storage: storage
});

app.post('/nexmo', function (req, res) {

    let from = 'Nexmo';
    let to = req.body.phone;
    let text = 'Validation code: ' + req.body.code;

    nexmo.message.sendSms(from, to, text);

    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + 'LAST_INSERT_ID()';
    let obj = {
        status: req.body.code
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });

    res.sendStatus(200);
});

//nodemailer

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

//MYSQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

let initDb = function () {
    connection.query('' +
        'CREATE TABLE IF NOT EXISTS social_network_users (' +
        'id int(11) NOT NULL AUTO_INCREMENT,' +
        'status varchar(50),' +
        'emailNumber varchar(50),' +
        'password varchar(50),' +
        'name varchar(50),' +
        'surname varchar(50),' +
        'birthday varchar(50),' +
        'male varchar(6),' +
        'avatar varchar(100),' +
        'PRIMARY KEY(id) )',
        function (err) {
            if (err) throw err;
        });
};

initDb();

app.get('/login', function (req, res) {
    let emailNum = '\"' + req.query.emailNum + '\"';
    let pass = '\"' + req.query.pass + '\"';
    let userCheck = "SELECT * FROM social_network_users WHERE password =" + " " + pass + " " + "AND emailNumber =" + " " + emailNum;

    connection.query(userCheck, function (err, responce) {
        if (err) throw err;
        res.status(200).send(responce);
    });

});

app.post('/regNewUser', function (req, res) {
    let obj = req.body;
    connection.query('INSERT INTO social_network_users SET ?', obj,
        function (err, result) {
            if (err) throw err;
            fs.open('./text/' + result.insertId + '.txt', 'w', function (err) {
                if (err) throw err;
            });
            res.sendStatus(200);
        });

});

app.post('/images', upload.any(), function (req, res, next) {
    let currentAvatarName = '../assets/userAvatars/' + req.files[0].filename;
    res.send(currentAvatarName);
    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + 'LAST_INSERT_ID()';
    let obj = {
        avatar: currentAvatarName
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });
});

app.get('/getCurrentUser', function (req, res) {
    let sql = 'SELECT * FROM social_network_users WHERE id =' + ' ' + 'LAST_INSERT_ID()';
    connection.query(sql, function (err, responce) {
        if (err) throw err;
        res.status(200).send(responce);
    });
});

app.post('/verification', function (req, res) {

    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + 'LAST_INSERT_ID()';
    let obj = {
        status: req.body.status
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });
    res.sendStatus(200);
});

app.post('/mailVerification', function (req, res) {

    let obj = {
        status: req.body.status

    };
    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + req.body.id;

    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });
    res.sendStatus(200);
});

app.post('/mail', function (req, res) {

    let mailOptions = {

        from: process.env.NODEMAILER_USER,
        to: req.body.toUser,
        subject: 'Social network registration',
        text: req.body.text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + 'LAST_INSERT_ID()';
    let obj = {
        status: req.body.randomPath
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });
    res.sendStatus(200);
});

app.get('/searchPass', function (req, res) {
    let emailNumber = '\"' + req.query.emailNumber + '\"';
    let userCheck = "SELECT * FROM social_network_users WHERE emailNumber =" + " " + emailNumber;
    connection.query(userCheck, function (err, responce) {
        if (err) throw err;
        res.status(200).send(responce);
    });

});

app.post('/newUserPass', function (req, res) {

    let mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: req.body.toUser,
        subject: 'Social network registration',
        text: req.body.text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + req.body.id;
    let obj = {
        status: req.body.randomCode
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });
    res.sendStatus(200);
});

app.get('/searchId', function (req, res) {
    let id = req.query.id;
    let userCheck = "SELECT * FROM social_network_users WHERE id =" + " " + id;
    connection.query(userCheck, function (err, responce) {
        if (err) throw err;
        res.status(200).send(responce);
    });

});

app.post('/sendPass', function (req, res) {

    let mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: req.body.toUser,
        subject: 'Social network registration',
        text: req.body.text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + req.body.id;
    let obj = {
        status: req.body.status
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });
    res.sendStatus(200);
});

app.post('/nexmoNewPass', function (req, res) {

    let from = 'Nexmo';
    let to = req.body.phone;
    let text = 'The code is: ' + req.body.code;

    nexmo.message.sendSms(from, to, text);

    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + req.body.id;
    let obj = {
        status: req.body.code
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });

    res.sendStatus(200);
});

app.post('/setNewPass', function (req, res) {

    let sql = 'UPDATE social_network_users SET ? WHERE id =' + ' ' + req.body.id;
    let obj = {
        status: req.body.status,
        password: req.body.password
    };
    connection.query(sql, obj, function (err, result) {
        if (err) throw err;
    });
    res.sendStatus(200);
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, function (err) {
    if (err) throw err;
    console.log('Server start on port 8000!');
});