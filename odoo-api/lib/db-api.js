const mysql = require('mysql');

class DbApi {

    constructor() {

    }
    connect(host, user, pwd, db) {
        // connection configurations
        this.dbConn = mysql.createConnection({
            host: 'localhost',
            user: 'odoo_api_db',
            password: 'ionCOME66.',
            database: 'odoo_api_db'
        });

        // connect to database
        this.dbConn.connect(function (err) {
            if (!err) {
                console.log("Base de datos OK ");
            } else {
                console.log("Error conexión base de datos " + err);
            }
        });
    }

    get connection() {
        return this.dbConn;
    }

    errorAccess(titular){        
        let contador = titular.contador_fallos + 1;
        let dt = this.toMysqlFormat(new Date());
        let sql = "\
                INSERT INTO usuarios\
                    (username, password, contador_fallos, ultimo_acceso)\
                VALUES\
                    ('" + titular.username + "'," + "'" + titular.password + "'," + contador + ",'" +  dt +"')\
                ON DUPLICATE KEY UPDATE\
                    password = '"+ titular.password + "', \
                    ultimo_acceso = '"+ dt + "', \
                    contador_fallos = "+ contador;

        this.dbConn.query(sql);
    }

    okAccess(titular){        
        let contador = 0;
        let dt = this.toMysqlFormat(new Date());
        let sql = "\
                INSERT INTO usuarios\
                    (username, password, contador_fallos, ultimo_acceso)\
                VALUES\
                    ('" + titular.username + "'," + "'" + titular.password + "'," + contador + ",'" +  dt +"')\
                ON DUPLICATE KEY UPDATE\
                    password = '"+ titular.password + "', \
                    ultimo_acceso = '"+ dt + "', \
                    contador_fallos = "+ contador;

        this.dbConn.query(sql);
    }

    twoDigits(d) {
        if(0 <= d && d < 10) return "0" + d.toString();
        if(-10 < d && d < 0) return "-0" + (-1*d).toString();
        return d.toString();
    }

    toMysqlFormat(date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
        //return date.getUTCFullYear() + "-" + this.twoDigits(1 + date.getUTCMonth()) + "-" + this.twoDigits(date.getUTCDate()) + " " + this.twoDigits(date.getUTCHours()) + ":" + this.twoDigits(date.getUTCMinutes()) + ":" + this.twoDigits(date.getUTCSeconds());
    };

    toDateFormat(timestamp) {
        return new Date(timestamp);
    }
}

module.exports = DbApi;
