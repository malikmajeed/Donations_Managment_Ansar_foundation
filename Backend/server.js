import express from 'express'
import dotenv from 'dotenv'
const app = express();
import cors from 'cors'
import mongoose from 'mongoose';
import studentRouter from './Routes/students.router.js';
import usersRouter from './Routes/users.router.js';
import donationsRouter from './Routes/donations.routes.js'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

app.use(express.json());
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.DATABASE_URL)
.then(()=>console.log('MongoDB connected successfully'))
.catch((err)=>console.log(`An Error occured While connecting to mongoDB: {err}`));

console.log('reading controllers')
app.use('/student/', studentRouter );
app.use('/user/', usersRouter );
app.use('/donation/', donationsRouter)

app.listen(process.env.PORT,()=>{
    console.log('Server is listening at : http://localhost:3000/')
})
