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

// Middleware to verify Firebase ID token
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization;
  if (!idToken) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

// Route to create a new user
app.post('/create-user', authenticate, async (req, res) => {
  const { email, password, displayName, role } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Optionally, set custom claims (roles) for the user
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Add user data to the database
    const userRef = admin.database().ref(`userList/${req.user.uid}/${userRecord.uid}`);
    await userRef.set({
      name: displayName,
      email,
      role,
      signInTime: new Date().toISOString(),
      blocked: false,
    });

    res.status(201).send({ uid: userRecord.uid });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
