const url = `https://97p7tnf4-3000.uks1.devtunnels.ms`
const resMessage = document.getElementById("resMessage")
const checkMark = '<i class="fa-solid fa-check-double"></i>'
const xMark ='<i class="fa-solid fa-square-xmark fa-xl"></i>'
const questionMark ='<i class="fa-solid fa-question"></i>'
const eye ='<i class="fa-solid fa-xl fa-eye" style="color:#f1baae"></i>'
const eyeSlash ='<i class="fa-solid fa-xl fa-eye-slash" style="color:#f1baae"></i>'
const gears ='<i class="fa-solid fa-xl fa-gears" style="color:white"></i>'
const emailField = document.getElementById('email')
const passwordField = document.getElementById('password')
const forgotPasswordA = document.getElementById('forgotPassword')
let forgotPassword = false

document.addEventListener("DOMContentLoaded",async function(e){
    emailField.focus()
})

//Login API OR Forgot Password API
document.getElementById("form").addEventListener('submit', async function (e) {
    e.preventDefault()

    if(!forgotPassword){

        const formEntries = new FormData(this) 
        const formData = Object.fromEntries(formEntries)
        
        try {
            const response = await fetch(`${url}/api/v1/auth/login`,{
                method:'POST',
                body: JSON.stringify(formData),
                headers:{ 'Content-Type': 'application/json'}
            })

            const result = await response.json()
            console.log("result:",result)
        
            if(response.ok){
                resMessage.innerHTML = `Login in successful! 👌`
                setTimeout(location.href = 'Theater.html',1500)
            }else {
                resMessage.innerHTML = `${result.message} ${xMark}`
            }
        }catch(e){
            console.log("Error:",e)
            resMessage.innerHTML = `Something went wrong! Please try again later. ${xMark}`
        }
    } else{

        try{
            const response = await fetch(`${url}/api/v1/auth/forgotPassword`,{
                method:'PATCH',
                body:JSON.stringify({email:emailField.value}),
                headers: {'Content-Type':'application/json' }
            })

            const result = await response.json()
            if(response.ok){
                resMessage.innerHTML = `${result.message} ${checkMark}`
            }else{
                resMessage.innerHTML = `${result.message} ${xMark}`
            }
        }catch(e){
            resMessage.innerHTML = `${gears} ${e.message} ${xMark}`
            console.log("Error:",e)   
        }
    }
})


//Show Password
document.getElementById("showPassword").addEventListener('click',async(event)=>{
    event.preventDefault()
    passwordField.type = passwordField.type == 'password' ? 'text' : 'password' 
    if(passwordField.type == 'password')
        document.getElementById("showPassword").innerHTML = `${eye}`
    else
        document.getElementById("showPassword").innerHTML = `${eyeSlash}`
})


//Forgot Password
forgotPasswordA.addEventListener('click',async(event)=>{
    event.preventDefault()

    forgotPassword = !forgotPassword
    if(forgotPassword){
        document.getElementById("passwordCon").style.backgroundColor = '#000000ab'
        document.getElementById("forgotPassword").textContent = 'Login Instead?'
        document.getElementById("loginBtn").textContent = 'Send a password reset link'
        resMessage.innerHTML = `${gears} Enter your email to send a reset password link to it `
        passwordField.disabled = true
        passwordField.value = ''
    }else{
        document.getElementById("loginBtn").textContent = 'Login'
        resMessage.innerHTML = ''
        document.getElementById("passwordCon").style.backgroundColor = '#00000017'
        document.getElementById("forgotPassword").textContent = 'Forgot Password?'
        passwordField.disabled = false
        passwordField.value = ''
    }

})

// hnur kwov qttm jwbg