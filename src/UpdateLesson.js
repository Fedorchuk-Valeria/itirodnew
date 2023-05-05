import { getDatabase, set, get, update, remove, push, ref, query, limitToLast, child, onValue } from './firebaseInitializer.js'

    //   import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";

    //   const firebaseConfig = {
    //       apiKey: "AIzaSyD3KdVLldNnZ0tRn99IYSwcr4nCH3Z_C3U",
    //       authDomain: "wifirebase.firebaseapp.com",
    //       databaseURL: "https://wifirebase-default-rtdb.firebaseio.com",
    //       projectId: "wifirebase",
    //       storageBucket: "wifirebase.appspot.com",
    //       messagingSenderId: "866141131394",
    //       appId: "1:866141131394:web:36d9b215055efecc9c5a9b"
    //   };
          
    //   const app = initializeApp(firebaseConfig);

    //   import {getDatabase, set, get, update, remove, ref, query, limitToLast, child, onValue}
    //   from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
    //   const database = getDatabase();
    //   let dbref = ref(database)

    //   //_________________________________________________________________________________________

      const dateInput = document.getElementById("dateInput")
      const themeSelect = document.getElementById("themeSelect")
      const moduleSelect = document.getElementById("moduleSelect")
      const UpdateButton = document.getElementById("UpdateButton")
      
      //_________________________________________________________________________________________

      let currLesson = JSON.parse(sessionStorage.getItem('currLesson'))
      console.log(currLesson)

      console.log(currLesson.startDate.substr(0, 19))
      dateInput.value = currLesson.startDate.substr(0, 19)

      get(child(dbref, "ages/")).then(data=> {
        if(data.exists()){
          const age = (data.val().filter(a => a.name === currLesson.age))[0];
          console.log(age)
          moduleSelect.innerHTML = ""
          age.moduleIds.forEach(id => get(child(dbref, "modules/" + id)).then(d=> {
            if(d.exists()){

              moduleSelect.innerHTML += "<option id=" + d.val().name + ">" + d.val().name + "</option>"

              if( d.val().name === currLesson.startModule) {

                moduleSelect.value = currLesson.startModule;

                themeSelect.innerHTML = ""
                console.log(d.val().themes)

                d.val().themes.forEach( theme => 
                  themeSelect.innerHTML += "<option>" + theme + "</option>"
                )
                themeSelect.value = currLesson.startTheme
              }

            }
          }))
        }
      })

      //_________________________________________________________________________________________


      moduleSelect.addEventListener('change', () => {
        get(child(dbref, "modules/")).then(data=> {
          if(data.exists()){
            const module = (data.val().filter(a => a.name === moduleSelect.value))[0];
            themeSelect.innerHTML = ""
            module.themes.forEach(theme => themeSelect.innerHTML += "<option>" + theme + "</option>")

            const themeDiv = document.getElementById("themeDiv")
            themeDiv.classList.remove("hidden")
          }
        })
      })
      

      const moduleContainer = document.getElementById("moduleContainer")

      UpdateButton.addEventListener('click', e => {
        e.preventDefault()
        update(ref(database, "lessons/" + currLesson.id.toString()), {
          startDate: dateInput.value,
          startModule: moduleSelect.value,
          startTheme: themeSelect.value
        }).then(() => {
          console.log("ok");               
          window.location.href = './Timetable.html'; })
        .catch(error => console.log(error))
      })