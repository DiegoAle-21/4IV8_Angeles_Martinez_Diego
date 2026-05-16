const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const db = mysql.createPool({ host: 'localhost', user: 'root', password: 'Diego210509.', database: 'pnt_practica1' }).promise();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor inicializado en el puerto: 3000\nPara salir presiona Ctrl + C');
});



/*
//Primero necesitamos crear un sevidor para la aplicaccion y ahi mismo montar nuestra base de datos
//Este es el modulo nativo para cualquier servidor
const http = require('http');
//Necesitamos el modulo para leer los archivos del sistema
const fs = require('fs');
//el modulo para la ruta a identificar el archivo
const path = require('path');
//el modulo nativo para extraer parametros
const url = require('url');

//Este modulo lo tenemos que descargar con el comando npm install mysql2
const mysql = require('mysql2');

//Configuarar el servidor
const PORT = process.env.PORT || 3000;

//vamos a conectarnos a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Diego210509.',
    database: 'pnt_practica1',
    waitForConnections: true, //esperar si no hay conexiones disponibles
    connectionLimit: 10, //Maximo de conexiones simultaneas (Corregido: era connectionLimit)
    queueLimit: 0 //sin limite en la cola de espera
});

//Debemos configurar los tipos de archivos que son aceptados
const MIME_TYPES = {
    '.html':'text/html; charset=utf-8',
    '.css':'text/css; charset=utf-8',
    '.js':'text/javascript; charset=utf-8',
    '.json':'application/json; charset=utf-8',
    '.png':'image/png',
    '.jpg':'image/jpeg',
    '.ico':'image/x-icon'
}

//esta funcion se encargarra de leer los archivos en la carpeta public y los envia al navegador

function servirArchivoEstatico(req, res){
    //si la url es '/' servimoa a index-html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    //construimos las rutas de los archivos
    const fullPath = path.join(__dirname, 'public', filePath); // Corregido: path.join
    //obtenemos la extension del archivo para determinar el tipo de archivo
    const ext = path.extname(fullPath);
    const mimeType = MIME_TYPES[ext];

    if(!mimeType){
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Archivo no encontrado');
        return;
    }
    //leemos el archivo cuando si existe
    fs.readFile(fullPath, (error, contenido)=>{ // Corregido: fs.readFile
        if(error){
            res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('Archivo no encontrado');
        }else{
            res.writeHead(200, {'Content-Type': mimeType});
            res.end(contenido);
        }
    });
}


//debo de crear una preomesa de conexion 
const db = pool.promise();
//esto nos permite escribir codigo asincrono que tendra un tiempo de espera para conectarse, procesarse y dar una respuesta

//debemos de atender cada una de las peticiones que vengan por parte de la carpeta de public 
function leerBody(req){
    return new Promise((resolve, reject)=>{
        let body = '';
        //nosotros vamos a tener uhn evento que se dispara cada vez que llega uh pedazo de los datos
        req.on('data', (chunk) => {
            body += chunk.toString();
            //debo configurar el tamaño del body
            if(body.length > 1e6){ // Corregido: length
                req.destroy();
                reject(new Error('Body demasiado grande'));
            }
        });
        //el evento end se dispara cuando todos los datos han llegado
        req.on('end', () => {
            try{
                resolve(body ? JSON.parse(body) : {});
            }catch(e){
                reject(new Error('JSON invalido'))
            }
        });
        req.on('error', reject);
    });
}

//este elemento nos sirve para dar respuestas
function enviarJSON(res, statusCode, data){
    res.writeHead(statusCode, {'Content-Type':'application/json; charset=utf-8'});
    res.end(JSON.stringify(data));
}

//recibir todas las peticiones por parte del servidor, get, post, put, delete
const server = http.createServer(async (req, res) => {
    //tenemos que parsear la url
    const parseUrl = url.parse(req.url, true);
    const pathname = parseUrl.pathname;
    const method = req.method;

    //imprimir en el log cada peticion
    console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`); // Corregido: comillas y espacio

    //aqui tenemos que pprogar cada peticion que se vaya a realizar por parte del usuario

    //si la url no coincide con ninguna d elas rutas de la api intenta servir un archivo esatico
    servirArchivoEstatico(req, res);

});


//incializamos el servidor
server.listen(PORT, () =>{
    console.log('Servidor inicializado en el puerto: ' + PORT);
    console.log('Para salir presiona crtl + c');
})

//10 lineas de codigo

*/

