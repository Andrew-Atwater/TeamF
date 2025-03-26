// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator} from "firebase/firestore";
import {getAuth, connectAuthEmulator} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZNLvS7P1ql4Eu3tPmfz0HfB1X7dGBVlo",
    authDomain: "farhan-financial-planner.firebaseapp.com",
    projectId: "farhan-financial-planner",
    storageBucket: "farhan-financial-planner.firebasestorage.app",
    messagingSenderId: "707602290141",
    appId: "1:707602290141:web:6878a7a4d2a66411aad234"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

if(window.location.hostname === "localhost"){
    connectFirestoreEmulator(db, "localhost", 8080);
    
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}
export {app, db, auth}