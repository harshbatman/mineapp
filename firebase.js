import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBLI43RC_QN8LthWpN0Fe6yEg62pSIfsPo",
    authDomain: "mahto-b8626.firebaseapp.com",
    projectId: "mahto-b8626",
    storageBucket: "mahto-b8626.firebasestorage.app",
    messagingSenderId: "94425344059",
    appId: "1:94425344059:android:a81281a4dba8c3a3f0d41e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
