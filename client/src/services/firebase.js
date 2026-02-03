import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-8jp1jPRL2MXEVSRk1GtpfR7zNhbrpCo",
  authDomain: "esports-chat-4dbcd.firebaseapp.com",
  projectId: "esports-chat-4dbcd",
  storageBucket: "esports-chat-4dbcd.appspot.com",
  messagingSenderId: "1011323175670",
  appId: "1:1011323175670:web:3aaa493e859c3ee18f22d7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ THIS LINE IS CRITICAL
export const db = getFirestore(app);
