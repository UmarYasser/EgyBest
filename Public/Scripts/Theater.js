const url = `https://97p7tnf4-3000.uks1.devtunnels.ms`
const userinfo = document.getElementById("userinfo")
const resMessage = document.getElementById("resMessage")
const sliders = document.getElementById("sliders");
const sliderCons = document.getElementsByClassName("sliderCon")
const moviesSlider = document.getElementById("slider1")
const seriesSlider = document.getElementById("slider2")
const theaterSlider = document.getElementById("slider3")
const loader = document.getElementById("loader")
const searchBar = document.getElementById("searchBar")
const liveSearch = document.getElementById("liveSearch")

const xMark ='<i class="fa-solid fa-square-xmark fa-xl"></i>'
const screwDriver = '<i class="fa-solid fa-screwdriver-wrench"></i>'

// Page Loads: Fetching User +  Movies Data
document.addEventListener("DOMContentLoaded",async function(e){
    
    if(sessionStorage.getItem("userinfo") == null){
        try{
            const userinfoRes = await fetch(`${url}/api/v1/users/me`,{
                method:'GET',
                headers:{ 'Content-Type':'application/json' }
            })
            const userinfoResult = await userinfoRes.json()
            sessionStorage.setItem("userinfo", JSON.stringify(userinfoResult.data))
        }catch(e){
            console.log('Error',e)
        }
    }

    const user = JSON.parse(sessionStorage.getItem("userinfo"))
    userinfo.innerHTML = `
            <div id="userinfoCon">
                <img src="./../Images/Profile Picture.jpeg" width="45px" height="35px" >
                <span id="username">${user.username}</span>
            </div>`

        //**** Make the user/me API */✅
    try{
        const dball = await fetch(`${url}/api/v1/movies/`,{
            method:'GET',
            headers:{ 'Content-Type':'application/json' }
        })
        const dbresult = await dball.json()

        const moviesOnly = dbresult.data.movies.filter(m =>{ return m.type == 'movie'}  )
        const seriesOnly = dbresult.data.movies.filter(m =>  m.type == 'series' )
        const theaterOnly = dbresult.data.movies.filter(m =>{ return m.type == 'theater'} )

        for(let i  =0;i < moviesOnly.length;i++){
            moviesOnly[i].genres = moviesOnly[i].genres.join(' ')
            moviesSlider.innerHTML+=
           `<div class="movie ${moviesOnly[i].genres}">
                   <a href="/movie/${moviesOnly[i]._id}">
                       <div id="rating">
                           <div class="starvalue">
                                   <img src="./../Images/star.png">
                                   <span id="rateValue">${moviesOnly[i].rating}</span>
                               </div>
                           </div>
                           <img src="${moviesOnly[i].coverImage}" width="150" height="225px" style="border-radius:6px">
                            <p id="contentName">${moviesOnly[i].name}</p>
                        </a>
                    </div>`          
        }

        for(let i  =0;i < seriesOnly.length;i++){
            seriesOnly[i].genres = seriesOnly[i].genres.join(' ')

            seriesSlider.innerHTML+=
            `<div class="movie ${seriesOnly[i].genres}">
                    <a href="/movie/${seriesOnly[i]._id}">
                        <div id="rating">
                            <div class="starvalue">
                                <img src="./../Images/star.png">
                                <span id="rateValue">${seriesOnly[i].rating}</span>
                            </div>
                        </div>
                        <img src="${seriesOnly[i].coverImage}" width="150" height="225px" style="border-radius:6px">
                        <p id="contentName">${seriesOnly[i].name}</p>
                    </a>
                </div>`
        }

        for(let i  =0;i < theaterOnly.length;i++){
            theaterOnly[i].genres = theaterOnly[i].genres.join(' ')
            theaterSlider.innerHTML+=
            `<div class="movie ${theaterOnly[i].genres}">
                    <a href="/movie/${theaterOnly[i]._id}">
                        <div id="rating">
                            <div class="starvalue">
                                <img src="./../Images/star.png" >
                                <span id="rateValue">${theaterOnly[i].rating}</span>
                            </div>
                        </div>
                        <img src="${theaterOnly[i].coverImage}" width="150" height="225px" style="border-radius:6px" >
                        <p id="contentName">${theaterOnly[i].name}</p>
                    </a>
                </div>`
        }

        loader.style.display = 'none'
        sliders.style.display = 'block'
        for( let i = 0; i < sliderCons.length;i++)
            sliderCons[i].style.display = 'block'
    }catch(e){
        console.log('Error',e)
    }
})

//Live Search
searchBar.addEventListener("input",async function(e){
    const search = e.target.value.trim().toLowerCase()
    if(search.length >0){
        liveSearch.style.display = 'block'
        liveSearch.innerHTML = ''
        // Fetch/json from back-end
        try{
            const response = await fetch(`${url}/api/v1/movies/liveSearch?q=${search}`,{
                method:'GET',
                headers:{ 'Content-Type':'application/json' }
            })
            const result = await response.json()
            const movies = result.data.movies

            if(movies.length == 0){
                liveSearch.innerHTML = `
                <div class="liveSearchItem">
                <span style="position: relative;">No results found</span>
                </div>
                `
                
            }
            
            liveSearch.innerHTML = ''
            movies.forEach(mov =>{
                liveSearch.innerHTML += `
                <a href="/movie/${mov._id}/${mov.name}" class="liveSearchItem">
                <img src="${mov.coverImage}" width="50px" height="70px">
                <span class="nameLS">${mov.name}</span>
                </a>
                `
                liveSearch.querySelector("span").style.position = 'absolute'
            })
        }
        catch(e){
            console.log('Error:',e)
            liveSearch.style.display = 'none'
        }
    
    }
})

// Category Selection
let category ='all'
let categoryDoc
let categoryDocOld 
document.getElementById("categoriesUl").addEventListener("click",async function(e){
    if(e.target && e.target.nodeName == "LI"){
        //Revert the color of the old category
        if(categoryDocOld){
            document.getElementById(categoryDocOld).style.color = '#6c8085'
            document.getElementById(categoryDocOld).style.backgroundColor = '#07293d'
        }
        // Assign new category, the var. of the category to be inserted in getElementById, and set the old one.
        category = e.target.innerText.split(' ')[1]
        
        categoryDoc = category.toLowerCase() 

        if(categoryDoc != categoryDocOld){
            document.getElementById(categoryDoc).style.color = '#07293d'
            document.getElementById(categoryDoc).style.backgroundColor = '#6c8085'
        }else{ // If the same category is clicked: reset variables, and show all movies.
            category = 'All'
            categoryDoc = null
            categoryDocOld = null
        }


        categoryDocOld = categoryDoc
        
        resMessage.innerText = `Category: ${category}`
        // Make All movies visible again, so the new selection is applied to All, not on the old category filter.
        for(let i =1;i < moviesSlider.childNodes.length;i++){
            moviesSlider.childNodes[i].style.display = 'block'
        }
        
        for(let i =1;i < seriesSlider.childNodes.length;i++){
            seriesSlider.childNodes[i].style.display = 'block'
        }
        
        for(let i =1;i < theaterSlider.childNodes.length;i++){
            theaterSlider.childNodes[i].style.display = 'block'
        }
        //Inverse the colors of the selected category

        for(let i =1;i < moviesSlider.childNodes.length;i++){
            if(!moviesSlider.childNodes[i].classList.contains(category) && category != 'All'){
                moviesSlider.childNodes[i].style.display = 'none'
            }else if(category == 'All'){
                seriesSlider.childNodes[i].style.display = 'block'
            }
        }
        
        for(let i =1;i < seriesSlider.childNodes.length;i++){
            if(!seriesSlider.childNodes[i].classList.contains(category) && category != 'All'){
                seriesSlider.childNodes[i].style.display = 'none'
            }else if(category == 'All'){
                seriesSlider.childNodes[i].style.display = 'block'
            }
        }

        for(let i =1;i < theaterSlider.childNodes.length;i++){
            if(!theaterSlider.childNodes[i].classList.contains(category) && category != 'All'){
                theaterSlider.childNodes[i].style.display = 'none'
            }else if(category == 'All'){
                theaterSlider.childNodes[i].style.display = 'block'
            }
        }

    }
})


// Saved Content
let savedOn = false
document.getElementById("saved").addEventListener("click",async function(e){
    savedOn = !savedOn
    if(savedOn){
        if(categoryDoc){
            document.getElementById(categoryDoc).style.color = '#6c8085'
            document.getElementById(categoryDoc).style.backgroundColor = '#07293d'
        }

        resMessage.innerHTML = `${screwDriver} Saved Content`
        // 'Saved' Button
        document.getElementById("saved").style.color = '#07293d'
        document.getElementById("saved").style.backgroundColor = '#6c8085'
        

        //Loader
        sliders.style.display = 'flex'
        sliders.style.justifyContent = 'center'
        sliders.style.alignItems = 'center'
        
        loader.style.display = 'block'
        for( let i = 0; i < sliderCons.length;i++)
            sliderCons[i].style.display = 'none'
        
        let contentName
        //Sliders' Titles
        document.querySelector("#movies #sliderTitle").innerText = 'Saved Movies'
        document.querySelector("#series #sliderTitle").innerText = 'Saved Series'
        document.querySelector("#theaters #sliderTitle").innerText = 'Saved Theater'
        
        try{
            //Fetch/json from back-end
            const response = await fetch(`${url}/api/v1/users/getSaved`,{
                method:'GET',
                headers: {'Content-Type':'application/json' }
            })
            
            const result = await response.json()
            //Hiding the content that aren't in saved content
            for(let i =1;i< moviesSlider.childNodes.length;i++){
                contentName = moviesSlider.childNodes[i].querySelector("#contentName").innerText
                if(!result.data.savedContent.includes(contentName)){
                    console.log('moviesSlider.childNodes[i]:',moviesSlider.childNodes[i])
                    moviesSlider.childNodes[i].style.display = 'none'
                }
            }
            
            for(let i =1;i< seriesSlider.childNodes.length;i++){
                contentName = seriesSlider.childNodes[i].querySelector("#contentName").innerText
                if(!result.data.savedContent.includes(contentName)){
                    seriesSlider.childNodes[i].style.display = 'none'
                }
            }
            
            for(let i =1;i< theaterSlider.childNodes.length;i++){
                contentName = theaterSlider.childNodes[i].querySelector("#contentName").innerText
                if(!result.data.savedContent.includes(contentName)){
                    theaterSlider.childNodes[i].style.display = 'none'
                }
            }
            
            //Removinng Loader + Showing Sliders
            loader.style.display = 'none'
            sliders.style.display = 'block'
            for( let i = 0; i < sliderCons.length;i++)
                sliderCons[i].style.display = 'block'
            
        }catch(e){
            console.log("Error:",e)
            resMessage.innerHTML = `Something went wrong! Please try again later. ${xMark}`
        }
    }else if(!savedOn){
        // 'Saved' Button
        document.getElementById("saved").style.color = '#6c8085'
        document.getElementById("saved").style.backgroundColor = '#07293d'

        resMessage.innerText = `Category: All`

        // Sliders' Titles
        document.querySelector("#movies #sliderTitle").innerText = 'Popular Movies'
        document.querySelector("#series #sliderTitle").innerText = 'Popular Series'
        document.querySelector("#theaters #sliderTitle").innerText = 'Popular Theater'        

        // Make all content visible again
        for(let i =1;i < moviesSlider.childNodes.length;i++)
            moviesSlider.childNodes[i].style.display = 'block'
        
        for(let i =1;i < seriesSlider.childNodes.length;i++)
            seriesSlider.childNodes[i].style.display = 'block'

        for(let i =1;i < theaterSlider.childNodes.length;i++)
            theaterSlider.childNodes[i].style.display = 'block'
        
    }
})
// *** When selecting a category then 'saved', the category color doesn't revert back.


// Watch Later
document.getElementById("watchLater").addEventListener("click",async function(){
    resMessage.innerHTML = `${screwDriver} Watch Later - Coming Soon!`

    document.getElementById("comingSoon").style.display =  document.getElementById("comingSoon").style.display == 'block' ? 'none' : 'block'
})

// Left #1 for script: make the username dynamic✅,      MOVIE PAGE***🛠
// Left #2: Make the categories filter the movies✅ 18/9
// Dashboard (that doesn't depend on movie page): Saved Movies, Watch Later, Explorer ...👈👈
// Left #3: Make the search bar work (frontend + backend) [Live Search] ...✅ 21/9
