const express = require('express');
const cors = require('cors');

const https = require("https"),
  fs = require("fs"),
  helmet = require("helmet");

if (process.argv.indexOf('-dev')>=0)
    require('dotenv').config({path: __dirname + '/.env.dev'});
else
    require('dotenv').config();

console.log('Environment ' +  process.env['NODE_ENV']);

const app = express();
const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:8100',    
    'https://95.179.163.170',
    'https://apptitular.micomedor.net',

];
const bodyParser = require('body-parser');

const Odoo = require('odoo-xmlrpc');


const odoo = new Odoo({
    url:        process.env['ODOO_URL'],
    port:       process.env['ODOO_PORT'],
    db:         process.env['ODOO_DB'],
    username:   process.env['ODOO_USER'],
    password:   process.env['ODOO_PWD']
});

const DbApi = require('./lib/db-api');

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    }
}

app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(helmet()); 
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});

const dbapi = new DbApi();
dbapi.connect(process.env['MYSQL_HOST'], process.env['MYSQL_USER'], process.env['MYSQL_PWD'], process.env['MYSQL_DB']);

// Login
app.post('/login', function (req, res) {

    //console.log('/login ' + req.body.username + ' ' + req.body.password);
    if (!req.body.password || req.body.password.length != 6)
        return res.send({ error: true, data: null, message: 'Contraseña no válida' });

    var titular = {
        id: null,
        db_id: null,
        username: req.body.username,
        password: req.body.password,
        name: null,
        bank: null,
        childs: [],
        contador_fallos: 0,
        ultimo_acceso: null
    };

    var sql = "SELECT * from usuarios WHERE username = '" + req.body.username + "'";
    dbapi.connection.query(sql, function (err, rows) {
        if (err) return res.send({ error: true, data: err, message: 'Error conexión base de datos' });

        if (rows.length > 0) {
            titular.db_id = rows[0]['id'];
            titular.contador_fallos = rows[0]['contador_fallos'];

            if (titular.contador_fallos >= 5) {
                titular.ultimo_acceso = dbapi.toDateFormat(rows[0]['ultimo_acceso']);

                let tz = 1000 * 60 * Number(new Date().getTimezoneOffset());
                let day1 = 1000 * 3600 * 24;
                let now = new Date();
                let dif = now.getTime() + tz - titular.ultimo_acceso.getTime();
                if (dif < day1) {
                    dbapi.errorAccess(titular);
                    return res.send({ error: true, data: req.body, message: "El usuario ha sido bloqueado, consulte con soporte." });
                }
            }
        }

        odoo.connect(function (err) {
            if (err) return res.send({ error: true, data: err, message: 'Error conexión con backend' });

            var inParams = [];
            inParams.push([['x_ise_nie', '=', req.body.username], ['x_ise_estado', '=', 'titular']]);
            odoo.execute_kw('res.partner', 'search', [inParams], function (err, value) {
                if (err) return res.send({ error: true, message: 'Error de acceso' });

                inParams = [];
                inParams.push(value); //ids
                inParams.push(['name', 'bank_ids', 'child_ids']); //fields

                odoo.execute_kw('res.partner', 'read', [inParams], function (err, value) {
                    if (err || !value || value.length == 0) { return res.send({ error: true, message: 'Error de acceso' }); }
                    titular.id = value[0].id;
                    titular.name = value[0].name;

                    // Find banks
                    inParams = [];
                    inParams.push([['partner_id', '=', titular.id]]);
                    odoo.execute_kw('res.partner.bank', 'search', [inParams], function (err, value) {
                        if (err) {
                            dbapi.errorAccess(titular);
                            return res.send({ error: true, message: 'Error de acceso' });
                        }
                        var inParams = [];
                        inParams.push(value); //ids
                        inParams.push(['acc_number']); //fields

                        odoo.execute_kw('res.partner.bank', 'read', [inParams], function (err, value) {
                            if (err || !value || value.length == 0) {
                                dbapi.errorAccess(titular);
                                return res.send({ error: true, message: 'Error de acceso' });
                            }

                            let found = false;
                            for (let i = 0; i < value.length; i++) {
                                if (value[i].acc_number && value[i].acc_number.length>6){
                                    let digits = value[i].acc_number.replace(/\s/g,'').slice(-6);
                                    if (digits == req.body.password) {
                                        found = true;
                                        titular.bank = value[i];
                                        break;
                                    }
                                }
                            }
                            if (!found) {
                                dbapi.errorAccess(titular);
                                return res.send({ error: true, data: err, message: 'Contraseña no válida' });
                            }

                            // Find childs
                            inParams = [];
                            inParams.push([['parent_id', '=', titular.id]]);
                            odoo.execute_kw('res.partner', 'search', [inParams], function (err, value) {
                                if (err) { return res.send({ error: true, message: 'Error de acceso' }); }
                                var inParams = [];
                                inParams.push(value); //ids
                                inParams.push(['name', 'x_ise_centro', 'active_school_id']); //fields

                                odoo.execute_kw('res.partner', 'read', [inParams], function (err, value) {
                                    if (err) { return res.send({ error: true, message: 'Error de acceso' }); }

                                    if (value && value.length > 0)
                                        titular.childs = value;
    
                                    dbapi.okAccess(titular);

                                    return res.send({ error: false, data: titular, message: 'success' });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.post('/get_month', function (req, res) {

    odoo.connect(function (err) {
        if (err) return res.send({ error: true, data: err, message: 'Error conexión con backend' });

        var inParams = [];
        inParams.push([['student_id', '=', Number(req.body.student_id)], ['year', '=', req.body.year], ['month', '=', req.body.month]]);
        odoo.execute_kw('scat.student', 'search', [inParams], function (err, value) {
            if (err || !value || value.length == 0) { return res.send({ error: true, message: 'No hay datos '  }); }
            var inParams = [];
            let id = value[0];
            inParams.push(value[0]); //ids
            var fields = [];
            for (var i = 1; i <= 31; i++) {
                fields.push('dia' + i);
            }
            inParams.push(fields); //fields

            odoo.execute_kw('scat.student', 'read', [inParams], function (err, value) {
                if (err || !value || value.length == 0) return res.send({ error: true, message: 'Error de acceso' });
                return res.send({ error: false, data: value, time: new Date(), id:id, message: 'success' });
            });
        });
    });
});

app.post('/get_preaviso', function (req, res) {

    odoo.connect(function (err) {
        if (err) return res.send({ error: true, data: err, message: 'Error conexión con backend' });

        var inParams = [];
        inParams.push([['school_ids', '=', Number(req.body.school_id)], ['end_date', '=', false]]);
        odoo.execute_kw('scat.expediente', 'search', [inParams], function (err, value) {
            if (err || !value || value.length == 0) { return res.send({ error: true, message: 'No hay datos '  }); }

            var inParams = [];
            inParams.push(value); //ids
            inParams.push(['preaviso', 'school_id', 'n_expediente', 'end_date']); //fields

            odoo.execute_kw('scat.expediente', 'read', [inParams], function (err, value) {
                if (err || !value || value.length == 0) return res.send({ error: true, message: 'Error de acceso' });
                return res.send({ error: false, data: value, message: 'success' });
            });
        });
    });
});


app.post('/set_day', function (req, res) {

    odoo.connect(function (err) {
        if (err) return res.send({ error: true, data: err, message: 'Error conexión con backend' });

        var inParams = [];
        inParams.push([Number(req.body.id)]); //id to update
        let aux = { };
        aux[req.body.dia] = req.body.value;
        inParams.push(aux);

        odoo.execute_kw('scat.student', 'write', [inParams], function (err, value) {
            if (err) { return res.send({ error: true, data: err, message: 'Error escritura en backend, contacte con soporte' }); }
            return res.send({ error: false, data: value, message: 'success' });
        });

    });
});

// Add a new user  
app.post('/get_fields', function (req, res) {
    odoo.connect(function (err) {
        if (err) { return console.log(err); }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([]);
        inParams.push([]);
        inParams.push([]);
        inParams.push(['string', 'help', 'type']);  //attributes
        odoo.execute_kw('res.partner', 'fields_get', [inParams], function (err, value) {
            if (err) { return console.log(err); }
            return res.send({ error: false, data: value, message: 'success' });
        });
    });
});




if (process.env['NODE_ENV'] != 'development') {
    const options = {
        key: fs.readFileSync("/etc/letsencrypt/live/apptitular.micomedor.net/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/apptitular.micomedor.net/cert.pem")
    };
    https.createServer(options, app).listen(3000);
}
else {
    app.listen(3000);
}
console.log('Node server listen on port ' + 3000);



module.exports = app;