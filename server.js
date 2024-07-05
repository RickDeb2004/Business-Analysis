const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://buisness-bf4ca-default-rtdb.firebaseio.com"
});

const app = express();
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
