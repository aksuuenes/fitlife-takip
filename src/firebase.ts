// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBV56uOZ51Y-Coog2USjdlwLXWKFZ768IA",
  authDomain: "fitlife-5cc6c.firebaseapp.com",
  projectId: "fitlife-5cc6c",
  storageBucket: "fitlife-5cc6c.firebasestorage.app",
  messagingSenderId: "402029535287",
  appId: "1:402029535287:web:e4f91a5fb9a63b7783dfb2",
  measurementId: "G-RFMN0R5WYN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(app);

export { app, analytics };
