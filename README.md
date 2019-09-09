# miComedor apptitular + nodejs-odoo servidor

App IONIC v.4, app para gestión de titular de usuarios de comedor.

El backend es un servidor Odoo, donde la comunicación se realiza a través del api odoo-xmlrpc mediante un servidor intermedio nodejs y una base de datos MySQL.

La aplicación usa https://www.npmjs.com/package/odoo-xmlrpc para acceder a la API de odoo (https://www.odoo.com/documentation/10.0/api_integration.html)


## Instalación

* Clonar este repositorio: `git clone https://github.com/...`
* Ejecutar `cd odoo-api`
* Ejecutar `npm install`
* Ejecutar `node server.js` para levantar el servidor nodejs.

* Ejecutar `cd ../app`
* Ejecutar `npm install`.
* Ejecutar `ionic serve` para levantar la aplicación.

## Configuración
Para configurar el servidor nodejs, debe generar un fichero .env en el directorio odoo-api con los siguientes parámetros de conexión a ODOO y a MySQL:
* NODE_ENV = production
* ODOO_URL  =
* ODOO_PORT = 
* ODOO_DB   = 
* ODOO_USER = 
* ODOO_PWD  =
* MYSQL_HOST = 
* MYSQL_USER = 
* MYSQL_PWD  =
* MYSQL_DB   = 



## Despliegue App

### Progressive Web App (PWA)

1. Ejecutar `npm run ionic:build --prod`
2. Colocar el directorio  `www` en su proveedor de hosting

### Android

1. Ejecutar `ionic cordova run android --prod`

### iOS

1. Ejecutar `ionic cordova run ios --prod`