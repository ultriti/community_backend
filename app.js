const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const multer = require('multer');
const connect_DB = require('./mongodb/db.js');
const userRoutes = require('./routes/User.routes.js');
const messageRoutes = require('./routes/Message.routes.js');
const { server, app } = require('./socket/socket.js');

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' }); // Optional: for file uploads

// 🧠 Connect to MongoDB
connect_DB();

// 🌐 CORS for REST API
app.use(cors(
  {
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, process.env.VITE_BASE_URL],
    credentials: true,
  }
))

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

app.use('/users', userRoutes);
app.use('/users/thoughts', userRoutes);
app.use('/users/message', messageRoutes);

// 🚀 Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
