import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import { server, app } from './lib/socket.js'; 
import { connectDB } from './lib/db.js';
import { bodyparser } from './middleware/bodyparser.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// middlewares
app.use(bodyparser);
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174","https://chat-app-1-zpc6.onrender.com"],
  credentials: true ,
   methods: ["GET", "POST", "PUT", "DELETE"],
}));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// start server (use server.listen instead of app.listen)
server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
