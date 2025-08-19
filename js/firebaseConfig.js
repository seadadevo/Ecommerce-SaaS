import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjccDim3IIKBXoUbNFWI4lHzPOtQW0Zzo",
  authDomain: "ecommerce-saas-6988d.firebaseapp.com",
  projectId: "ecommerce-saas-6988d",
  storageBucket: "ecommerce-saas-6988d.firebasestorage.app",
  messagingSenderId: "400721761676",
  appId: "1:400721761676:web:634a2280ecceaa7c7832a9",
  measurementId: "G-RR6B53N1Y4",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);


