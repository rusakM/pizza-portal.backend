const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Socket = require('socket.io');

process.on('uncaughtException', (err) => {
    console.log('Uncaught exception! Shutting down...');
    process.exit(1);
});

const app = require('./app');

dotenv.config({
    path: './config.env',
});

const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('connection with db OK!'))
    .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on ${port}...`);
});

const io = new Socket.Server(server, {
    cors: { origin: '*' },
});

app.set('io', io);

process.on('unhandledRejection', (err) => {
    console.log('Unhandles rejection. Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down...');
    server.close(() => {
        console.log('Process terminated');
    });
});
