import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4qZd1Y4ScfVg30vaAnWWWHI5qt5WoPE0",
  authDomain: "fjwu-events.firebaseapp.com",
  projectId: "fjwu-events",
  storageBucket: "fjwu-events.appspot.com",
   appId: "YOUR_APP_ID",   
  messagingSenderId: "316363782679",
  appId: "1:316363782679:web:08aaf74288b0ef60927a52",
  measurementId: "G-N78Z8NYX47"             // add this from Firebase console

};

const app = initializeApp(firebaseConfig);

// Initialize Firebase app

// Export Auth and Firestore instances
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
