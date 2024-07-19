// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq7u7AL8xcZ_MaYc6ULM-JZDy1oMlIGTk",
  authDomain: "note-taking-app-50cee.firebaseapp.com",
  projectId: "note-taking-app-50cee",
  storageBucket: "note-taking-app-50cee.appspot.com",
  messagingSenderId: "175598466074",
  appId: "1:175598466074:web:899899ec054ad7574b0da3",
  measurementId: "G-CSFEZXZPBT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);  // Initialize Firebase Authentication
const db = getFirestore(app);  // Initialize Cloud Firestore


export { auth, db };
