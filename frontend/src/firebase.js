import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_31_kZT1beUfAZTXWO4d4h83SkVSi_LY",
  authDomain: "crm-template-dfc6c.firebaseapp.com",
  projectId: "crm-template-dfc6c",
  storageBucket: "crm-template-dfc6c.firebasestorage.app",
  messagingSenderId: "528730389803",
  appId: "1:528730389803:web:3414b419d5eafd947e996e",
  measurementId: "G-8NHE55HDY0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();