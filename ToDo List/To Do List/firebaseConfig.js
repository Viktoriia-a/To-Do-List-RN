import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD30WR1O8xivRFyLddA0dRQFXVggjw6Lvo",
    authDomain: "to-do-list-4e246.firebaseapp.com",
    projectId: "to-do-list-4e246",
    storageBucket: "to-do-list-4e246.firebasestorage.app",
    messagingSenderId: "44236472951",
    appId: "1:44236472951:web:2026280c0be0ee09643c72"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db};