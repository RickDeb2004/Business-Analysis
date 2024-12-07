const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIo = require('socket.io');
// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buisness-bf4ca-default-rtdb.firebaseio.com"
});

const app = express();
const server = require('http').createServer(app);
const io = socketIo(server, {
    cors: {
      origin: '*',
    }
  });
  
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Route to create a new user
app.post('/create-user', async (req, res) => {
  const { email, password, displayName, role, uid } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      uid: uid,
      email: email,
      password: password,
      displayName: displayName,
    });

    // Extract adminId from uid (assuming format is adminId_uuid)
    const adminId = uid.split('_')[0];

    // Add user data to the database under the specified reference
    const userRef = admin.database().ref(`userList/${adminId}/${userRecord.uid}`);
    await userRef.set({
      name: displayName,
      email,
      role,
      password,
      signInTime: "yet to login",
      blocked: false,
    });

    res.status(201).send({ uid: userRecord.uid });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected');
  
    socket.on('joinRoom', ({ adminId }) => {
      socket.join(adminId);
    });
  
    socket.on('sendMessage', ({ adminId, message }) => {
      const messageRef = admin.database().ref(`chats/${adminId}`).push();
      messageRef.set({
        message,
        timestamp: Date.now(),
        sentByMe: true,
      });
      io.to(adminId).emit('receiveMessage', { message, timestamp: Date.now(), sentByMe: true });
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
