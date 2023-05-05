
import { getDatabase, set, get, update, remove, push, ref, query, limitToLast, child, onValue } from './firebaseInitializer.js'

// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";

//         const firebaseConfig = {
//             apiKey: "AIzaSyD3KdVLldNnZ0tRn99IYSwcr4nCH3Z_C3U",
//             authDomain: "wifirebase.firebaseapp.com",
//             databaseURL: "https://wifirebase-default-rtdb.firebaseio.com",
//             projectId: "wifirebase",
//             storageBucket: "wifirebase.appspot.com",
//             messagingSenderId: "866141131394",
//             appId: "1:866141131394:web:36d9b215055efecc9c5a9b"
//         };
        
//         const app = initializeApp(firebaseConfig);
        
//         import {getDatabase, set, get, update, remove, ref, query, limitToLast, child, onValue}
//         from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
//         const database = getDatabase();
//         let dbref = ref(database)
        
        //_________________________________________________________________________________________
        
        const moduleContainer = document.getElementById("moduleContainer")
        const moduleInput = document.getElementById("moduleInput")
        const addThemeButton = document.getElementById("addThemeButton")  
        const addModuleButton = document.getElementById("addModuleButton") 
        const themeContainer = document.getElementById("themeContainer")
        const themeInput = document.getElementById("themeInput")
        
        //_________________________________________________________________________________________
        
        let themes = []
        let modules = []

        //_________________________________________________________________________________________
        
        addThemeButton.addEventListener('click', e => {
            e.preventDefault()
            themes.push(themeInput.value)
            themeContainer.innerHTML += `<span> "${themeInput.value}"  </span>`
        })
        
        // -----------------
        
        addModuleButton.addEventListener('click', e => {
            e.preventDefault()
            
            set(ref(database, "modules/" + (parseInt(modules[modules.length-1].id, 10) + 1).toString()), {
                name: moduleInput.value,
                themes: themes
            }).then(() => {console.log("ok"); UpdateModules()})
            .catch(error => console.log(error))
        })
        // -----------------
        
        //для удалениея темы нужно знать id модуля
        //взять его темы и удалить ненужную 
        // update 
        
        //для удалениея модуля нужно знать его id

        
        //_________________________________________________________________________________________

        
        function deleteModule (id) {
            remove(ref(database, "modules/" + id.toString()))
        }

        //_________________________________________________________________________________________

        UpdateModules()
        
        function UpdateModules () {
            get(query(ref(database, 'modules/'))).then( data => {
                if(data.exists()){
                    const modulesData = Array.from(data.val())
                    
                    let id = 0
                    modules = []
                    modulesData.forEach(module => {
                        if(module === null || module ===  undefined) {
                            id += 1
                            return
                        } 
                        modules.push({...module, id: id})
                        id += 1
                    })
                    
                    console.log(modules)
                                    

                    modules = modules.filter(module => module !== null && module !== undefined)
                    moduleContainer.innerHTML = ""
                    for (let i = 0; i < modules.length; i++){
                        let module = modules[i]
                        
                        let themesHTML = "";
                        if (module.themes !== undefined && module.themes !== null) {
                            module.themes.forEach(theme => {
                            let themeHTML =
                            `        <li class="space_between full_width">` +
                            `            <p>${theme}</p>` +
                            `            <button class="no_default_styles left-border"> Delete </button>` +
                            `        </li>` 

                            themesHTML += themeHTML
                        });
                        }
                        
                        moduleContainer.innerHTML += 
                        `<li class="centered_row gray_background_color indented full_width">` +
                        `    <p class="bigger_font_size">${module.name}</p>` +
                        `    <p>lessons:</p>` +
                        `    <ul class="centered_row top_border full_width">` +
                        themesHTML +
                        `    </ul>` +
                        `    <div class="centered_row top_border full_width">` +
                        `        <button class="no_default_styles deleteModule" id="${module.id}"> Delete module</button>` +
                        `    </div>` +
                        `</li>`
                    }
                }
            }).then(()=> {
                let allDeleteModuleButtons = document.querySelectorAll(".deleteModule") 
                allDeleteModuleButtons.forEach(button=> {
                    button.addEventListener('click', () => {
                        const id = button.id
                        remove(ref(database, "modules/" + id.toString()))
                        UpdateModules()
                    })
                })
            }) 
        }
      