
import { getDatabase, set, get, update, remove, push, ref, query, limitToLast, child, onValue } from './firebaseInitializer.js'

// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyD3KdVLldNnZ0tRn99IYSwcr4nCH3Z_C3U",
//     authDomain: "wifirebase.firebaseapp.com",
//     databaseURL: "https://wifirebase-default-rtdb.firebaseio.com",
//     projectId: "wifirebase",
//     storageBucket: "wifirebase.appspot.com",
//     messagingSenderId: "866141131394",
//     appId: "1:866141131394:web:36d9b215055efecc9c5a9b"
// };
    
// const app = initializeApp(firebaseConfig);

// import {getDatabase, set, get, update, remove, ref, child, onValue}
//   from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

// const database = getDatabase();

var emailInput = document.getElementById("emailInput")
var passwordInput = document.getElementById("passwordInput")
var loginButton = document.getElementById("loginButton")
var not_found = document.getElementById("not_found")

loginButton.addEventListener('click', e => {
  e.preventDefault()

  let dbref = ref(database)

  get(child(dbref, "users")).then( data => {
    if(data.exists()){
      const user = data.val().filter(u=>
        u.email === emailInput.value &&
        u.password === passwordInput.value
      )[0]
      
      if(user === undefined) {
        not_found.innerHTML = 'not found'
      }
      else{
        let index = -1
        data.val().forEach(function (u, i) {
          if (u.email === user.email && u.password === user.password) {
            index = i
          }
        });

        sessionStorage.setItem('currUserId',index);
        window.location.href = './MainPage.html';
      }
    }
  })
})