import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {getDatabase, set, get, update, remove, ref, child, onValue} from 
"https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD3KdVLldNnZ0tRn99IYSwcr4nCH3Z_C3U",
    authDomain: "wifirebase.firebaseapp.com",
    databaseURL: "https://wifirebase-default-rtdb.firebaseio.com",
    projectId: "wifirebase",
    storageBucket: "wifirebase.appspot.com",
    messagingSenderId: "866141131394",
    appId: "1:866141131394:web:36d9b215055efecc9c5a9b"
};
    
const app = initializeApp(firebaseConfig);
const database = getDatabase();

export default {
    getDatabase, set, get, update, remove, push, ref, query, limitToLast, child, onValue
}

