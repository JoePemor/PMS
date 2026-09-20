import dotenv from 'dotenv';
import app from './app.js';
import connectDb from './db/dbConnector.js';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({
    path: './.env',
});
const port = process.env.APP_PORT || 3000;

connectDb()
    .then(() => {       
        app.listen(port, () => {
        console.log(`You are listening on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('mongoDB connection failed', err)
        process.exit(1)
    })

// index.js act's as an entry point of our application and only holds senstive configuration e.g dotenv, database connection  