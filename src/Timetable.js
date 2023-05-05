import { getDatabase, set, get, update, remove, push, ref, query, limitToLast, child, onValue } from './firebaseInitializer.js'


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";

// const firebaseConfig = {
// apiKey: "AIzaSyD3KdVLldNnZ0tRn99IYSwcr4nCH3Z_C3U",
// authDomain: "wifirebase.firebaseapp.com",
// databaseURL: "https://wifirebase-default-rtdb.firebaseio.com",
// projectId: "wifirebase",
// storageBucket: "wifirebase.appspot.com",
// messagingSenderId: "866141131394",
// appId: "1:866141131394:web:36d9b215055efecc9c5a9b"
// };
          
// const app = initializeApp(firebaseConfig);

// import {getDatabase, set, get, update, remove, ref, query, child, onValue}
// from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
// const database = getDatabase();
// let dbref = ref(database)


      //_________________________________________________________________________________________
      let lessons = []
      let newLessons = []
      //_________________________________________________________________________________________
      
      UpdateLessons()

      function UpdateLessons () {
        get(query(ref(database, 'lessons/'))).then( async data => {
          if(data.exists()){
              
            const lessonContainer = document.getElementById("lessonContainer")
            const currUserId = sessionStorage.getItem("currUserId")

            if( currUserId !== undefined && currUserId !== null) {
                        
              const lessonsData = Array.from(data.val())
              console.log(lessonsData)
              let id = 0
              lessons = []

              lessonsData.forEach(lesson => {
                  if(lesson === null || lesson ===  undefined) {
                      id += 1
                      return
                  } 
                  lessons.push({...lesson, id: id})
                  id += 1
                })

                console.log(lessons)
                
                newLessons = []
                
                lessons = lessons.filter(lesson => lesson !== null && lesson !== undefined)
              .filter(lesson => lesson.userId === sessionStorage.getItem("currUserId"))
              // .sort((a, b) => new Date(a.startDate) > new Date(b.startDate)? 1 : -1)

              for (let index = 0; index < lessons.length; index++) {
                  const lesson = lessons[index]

                  // if ((new Date(lesson.startDate)).getDate() === (new Date()).getDate()){
                      //   newLessons.push(lesson)
                //   continue
                // } 
                
                let monday = new Date()
                monday.setDate(new Date().getDate() - new Date().getDay() + 1)
                let sunday = new Date()
                sunday.setDate(monday.getDate() + 6)
                const lessonStartDate = new Date(lesson.startDate)
                // console.log(lesson.startDate)
                // console.log(lessonStartDate)
                
                if(lesson.lessonType !== "regular" && 
                !(monday < lessonStartDate && lessonStartDate < sunday) // дата не в этой неделе
                ) {
                  continue 
                }
                if(monday < lessonStartDate && lessonStartDate < sunday) { // дата в этой неделе
                    newLessons.push(lesson)
                    continue
                }
                if(new Date(lesson.startDate) > sunday) continue // еще будет 

                let sameDayOfWeek = new Date()
                sameDayOfWeek.setDate(monday.getDate() + new Date(lesson.startDate).getDay() -1)

                // console.log(sameDayOfWeek)
                // console.log(new Date(lesson.startDate))
                
                let weeksPassedCount = Math.round((sameDayOfWeek - lessonStartDate)/86400000) / 7 // сравнивать не с сегодня
                
                await get(child(dbref, "modules/")).then(data=> {
                    if(data.exists()){
                    const modules = data.val()
                    const module = (data.val().filter(a => a.name === lesson.startModule))[0];

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
                            i === moduleIndex  ) { //начинать с темы урока
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
                            // console.log(weeksPassedCount)
                            
                        })
                    }
                      catch(error){ 
                        // console.log(newLessons)
                        break
                      }
                    }
                  }
                })
              }
                        
              console.log(newLessons)
              
              const getLessonHTML = (lesson) => 
              `<li class="space-between indented">` +
              `  <div class="space-evenly">` +
              `    <p>${lesson.age}</p>` +
              `    <p>${lesson.lessonType}</p>` +
              `    <p>${lesson.startModule}</p>` +
              `    <p>${lesson.startTheme}</p>` +
              `  </div>` +
              
              `  <div class="row">` +
              `    <button class="no_styles_button peach_background_color editLessonButton" id="${lesson.id}">Edit</button>` +
              `    <button class="no_styles_button peach_background_color deleteLessonButton" id="${lesson.id}">Delete</button>` +
              `  </div>` +
              `</li>`
              
              // console.log(mondayLessons)
              // console.log(mondayLessons.innerHTML)
              
              const mondayLessons = document.getElementById("mondayLessons")
              const tuesdayLessons = document.getElementById("tuesdayLessons")
              const wednesdayLessons = document.getElementById("wednesdayLessons")
              const thursdayLessons = document.getElementById("thursdayLessons")
              const fridayLessons = document.getElementById("fridayLessons")
              const saturdayLessons = document.getElementById("saturdayLessons")
              const sundayLessons = document.getElementById("sundayLessons")
              
              newLessons.forEach(lesson => {
                  const lessonStartDate = new Date(lesson.startDate)

                  if(lessonStartDate.getDay() === 0){ // sunday
                    sundayLessons.innerHTML += getLessonHTML(lesson)
                }
                else if(lessonStartDate.getDay() === 1){ // monday
                    mondayLessons.innerHTML += getLessonHTML(lesson)
                }
                else if(lessonStartDate.getDay() === 2){ // tuesday
                  tuesdayLessons.innerHTML += getLessonHTML(lesson)
                }
                else if(lessonStartDate.getDay() === 3){ // wednes
                    wednesdayLessons.innerHTML += getLessonHTML(lesson)
                }
                else if(lessonStartDate.getDay() === 4){ // thursday
                    thursdayLessons.innerHTML += getLessonHTML(lesson)
                }
                else if(lessonStartDate.getDay() === 5){ // friday
                  fridayLessons.innerHTML += getLessonHTML(lesson)
                }
                else if(lessonStartDate.getDay() === 6){ // saturday
                  saturdayLessons.innerHTML += getLessonHTML(lesson)
                }
              })
            }
          }
        }).then(()=> {
          let deleteLessonButtons = document.querySelectorAll(".deleteLessonButton");

          console.log(deleteLessonButtons)

          deleteLessonButtons.forEach(button=> {
            button.addEventListener('click', e => {
              e.preventDefault()
              const id = button.id
              remove(ref(database, "lessons/" + id.toString()))
              sundayLessons.innerHTML = " "
              mondayLessons.innerHTML = " "
              tuesdayLessons.innerHTML = " "
              wednesdayLessons.innerHTML = " "
              thursdayLessons.innerHTML = " "
              fridayLessons.innerHTML = " "
              saturdayLessons.innerHTML = " "
              UpdateLessons()
            })
          })
          
          let editLessonButtons = document.querySelectorAll(".editLessonButton");

          console.log(deleteLessonButtons)

          editLessonButtons.forEach(button=> {
              button.addEventListener('click', e => {
                  e.preventDefault()
                  const id = button.id
                  
                  sessionStorage.setItem('currLesson', id)
                  let currlesson = newLessons.filter(l => l.id.toString() === id.toString())[0]
                  console.log(currlesson)
                  
                  sessionStorage.setItem('currLesson', JSON.stringify(currlesson))
                  
              window.location.href = './UpdateLesson.html';
              
            })
        })
    }
    )
}

