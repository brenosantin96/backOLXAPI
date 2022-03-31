require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileupload = require('express-fileupload');
const apiRoutes = require('./src/routes');

mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true
}, () => {
    console.log("Connected to database")
});

mongoose.Promise = global.Promise;

mongoose.connection.on('error', (error) => {
    console.log("Erro: ", error.message);
})


const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileupload());

server.use(express.static(__dirname + '/public'));
server.use('/', apiRoutes)


server.listen(process.env.PORT, () => {
    console.log(`Servidor iniciado na porta ${process.env.PORT}`);
})
