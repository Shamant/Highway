import { getFirestore, collection, query, where, getDocs, setDoc, doc, limit, addDoc, onSnapshot } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCz0uAMDnDk7T0v9BYV6ueIwp8zJGn0f10",
  authDomain: "psysync-6e2aa.firebaseapp.com",
  projectId: "psysync-6e2aa",
  storageBucket: "psysync-6e2aa.appspot.com",
  messagingSenderId: "186386703961",
  appId: "1:186386703961:web:59b7808ab3e53258bf3348",
  measurementId: "G-0RRF2PHJC2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db, collection, query, where, getDocs, setDoc, doc, limit, addDoc, onSnapshot };