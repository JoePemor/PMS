import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({
    path: './.env',
});
const port = process.env.APP_PORT || 3000;

app.listen(port, () => {
    console.log(`You are listening on http://localhost:${port}`)
})