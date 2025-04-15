import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
export const db = getFirestore(app);
export const auth = getAuth(app); 