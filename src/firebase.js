// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4WDudJqiWcTbjDpbwcsckfVJnI5yYxBI",
  authDomain: "buisness-bf4ca.firebaseapp.com",
  databaseURL: "https://buisness-bf4ca-default-rtdb.firebaseio.com",
  projectId: "buisness-bf4ca",
  storageBucket: "buisness-bf4ca.appspot.com",
  messagingSenderId: "676110692547",
  appId: "1:676110692547:web:3b98f18bdab30f37647276",
  measurementId: "G-KEG5PJEW6H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, analytics, auth, database };
