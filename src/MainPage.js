
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

        // import {getDatabase, set, get, update, remove, push, ref, query, limitToLast, child, onValue}
        // from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
        // const database = getDatabase();
        // let dbref = ref(database)

        //_________________________________________________________________________________________

        const dateInput = document.getElementById("dateInput")
        const typeSelect = document.getElementById("typeSelect")
        const moduleSelect = document.getElementById("moduleSelect")
        const themeSelect = document.getElementById("themeSelect")
        const ageSelect = document.getElementById("ageSelect")

        ageSelect.addEventListener('change', () => {
            get(child(dbref, "ages/")).then(data=> {
                if(data.exists()){
                    const age = (data.val().filter(a => a.name === ageSelect.value))[0];
                    moduleSelect.innerHTML = ""
                    age.moduleIds.forEach(id => get(child(dbref, "modules/" + id)).then(d=> {
                        if(d.exists()){
                            moduleSelect.innerHTML += "<option>" + d.val().name + "</option>"
                        }
                    }))

                    const moduleDiv = document.getElementById("moduleDiv")
                    moduleDiv.classList.remove("hidden")
                }
            })
        })

        // ------------------

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

        // ------------------

        const addLessonButton =  document.getElementById("addLessonButton")

        addLessonButton.addEventListener('click', e => {
            e.preventDefault()
            const error = document.getElementById("error"); 
            // console.log(sessionStorage.getItem("currUserId"))
            if(sessionStorage.getItem("currUserId") === undefined || sessionStorage.getItem("currUserId") === null){
                error.innerText = "not authentiated "
                return;
            }

            let lastLessonIndex = 0
            let lessons
            get(child(dbref, "lessons/")).then(data=> {
                if(data.exists()){
                    lessons = data.val()
                    lastLessonIndex = lessons.length
                }
            })
            .then(()=>{
                let lastLessonId = 0;

                get(query(ref(database, 'lessons/'), limitToLast(1))).then(data=> {
                    if(data.exists()){
                        lastLessonId = Object.keys(data.val())[0]
                        console.log(lastLessonId)
                    }
                })
                .then(()=>{
                    console.log("lessons/" + lastLessonIndex.toString())

                    set(ref(database, "lessons/" + (parseInt(lastLessonId, 10) + 1).toString()), {
                        age: ageSelect.value,
                        startModule: moduleSelect.value,
                        startTheme: themeSelect.value,
                        startDate: dateInput.value,
                        lessonType: typeSelect.value,
                        userId: sessionStorage.getItem("currUserId")
                    }).then(() => console.log("ok"))
                    .catch(error => console.log(error))

                    UpdateLessons()
                })

            })            
        })

        //_________________________________________________________________________________________

        UpdateLessons()

        function UpdateLessons () {
            get(child(dbref, "lessons/")).then(async data=> {
                if(data.exists()){
                    const lessonContainer = document.getElementById("lessonContainer")
                    const currUserId = sessionStorage.getItem("currUserId")

                    if( currUserId !== undefined && currUserId !== null) {
                        
                        let lessons = Array.from(data.val())
                        let newLessons = []

                        lessons = lessons.filter(lesson => lesson !== null && lesson !== undefined)
                        .filter(lesson => lesson.userId === sessionStorage.getItem("currUserId"))
                        .sort((a, b) => new Date(a.startDate).getHours() > new Date(b.startDate).getHours()? 1 : -1)

                        for (let index = 0; index < lessons.length; index++) {
                            const lesson = lessons[index]
                            // if (lesson === null || lesson === undefined) continue

                            if ((new Date(lesson.startDate)).getDate() === (new Date()).getDate()){
                                newLessons.push(lesson)
                                continue
                            } 
                            if( new Date().getDay() === new Date(lesson.startDate).getDay()) //проверка на день недели
                            {
                                if(lesson.lessonType !== "regular") continue

                                let weeksPassedCount = Math.round((new Date() - new Date(lesson.startDate))/86400000) / 7

                                await get(child(dbref, "modules/")).then(data=> {
                                    if(data.exists()){
                                        const modules = data.val()
                                        const module = (data.val().filter(a => a.name === lesson.startModule))[0];
                                        // let moduleIndex = modules.indexOf(module)
                                        let moduleIndex = -1
                                        data.val().forEach(function (m, i) {
                                            if (m.name === module.name) {
                                                moduleIndex = i
                                            }
                                        });
                                    
                                        for( let i = moduleIndex; i < modules.length; i++ ){
                                            try{
                                                modules[i].themes.forEach(theme => {
                                                    if (modules[i].themes.indexOf(theme) < modules[i].themes.indexOf(lesson.startTheme) && 
                                                        i === moduleIndex  ) {//начинать с темы урока
                                                        return
                                                    }
                                                    // console.log(theme)
                                                    if(weeksPassedCount === 0) {
                                                        newLessons.push({
                                                            ...lesson, 
                                                            startModule: modules[i].name,
                                                            startTheme: theme
                                                        })

                                                        throw new Error("Break the loop.")
                                                    }
                                                    weeksPassedCount -= 1
                                                    console.log(weeksPassedCount)
                                                })
                                            }
                                            catch(error){ 
                                                console.log(newLessons)
                                                break
                                            }
                                        }
                                    }
                                }) 
                            }
                        }
                        

                        console.log(newLessons) 
                        
                        lessonContainer.innerHTML = ""
                        newLessons.map(l => lessonContainer.innerHTML +=
                        `<li class="centered_row gray_background_color full_width indented">` +
                        `    <p>${new Date(l.startDate).getHours()} : ${new Date(l.startDate).getMinutes()}</p>` +
                        `    <div class="lesson space_between">` +
                        `        <p class="indented">${l.age}</p>` +
                        `        <p class="indented">${l.lessonType}</p>` +
                        `        <p class="indented">${l.startModule}</p>` +
                        `        <p class="indented">${l.startTheme}</p>` +
                        `    </div>` +
                        `</li>`
                        )
                    }
                }
            })
        }
        