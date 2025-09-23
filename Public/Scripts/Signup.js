const url = `https://97p7tnf4-3000.uks1.devtunnels.ms`
const resMessage = document.getElementById("resMessage")
const checkMark = '<i class="fa-solid fa-check-double"></i>'
const xMark ='<i class="fa-solid fa-square-xmark fa-xl"></i>'
const questionMark ='<i class="fa-solid fa-question"></i>'

//Signup Api
document.getElementById("form").addEventListener('submit', async function (e) {
    e.preventDefault()
    const formEntries = new FormData(this)
    const formData = Object.fromEntries(formEntries)

    try{
        const response = await fetch(`${url}/api/v1/auth/signup`,{
            method:'POST',
            body: JSON.stringify(formData),
            headers:{ 'Content-Type': 'application/json'}
        })

        const result = await response.json()

        if(response.ok){
            resMessage.innerHTML = `Signup successful!👌`
            setTimeout(location.href = './Theater.html',1500)

        }else{
            resMessage.innerHTML = `${result.message} ${xMark}`
        }
    }catch(e){
        console.log("Error:",e)
        resMessage.innerHTML = `<p style="color:red; margin:15px">Something went wrong! Please try again later. ${xMark}</p>`
        
    }
})