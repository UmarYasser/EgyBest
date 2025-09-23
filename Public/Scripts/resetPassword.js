const url = `https://97p7tnf4-3000.uks1.devtunnels.ms`
const resMessage = document.getElementById("resMessage")
const checkMark = '<i class="fa-solid fa-check-double"></i>'
const xMark ='<i class="fa-solid fa-square-xmark fa-xl"></i>'
const gears ='<i class="fa-solid fa-square-gears fa-xl"></i>'
const submit = document.getElementById("resetBtn")


//Reset Password API
document.getElementById("form").addEventListener('submit',async function(e){
    e.preventDefault()

    const formEntries = new FormData(this)
    const formData = Object.fromEntries(formEntries)
    const token = window.location.pathname.split('/')[2]

    console.log("fromData:",formData)
    try{
        const response = await fetch(`${url}/api/v1/auth/resetPassword/${token}`,{
            method:'PATCH',
            body: JSON.stringify(formData),
            headers:{ 'Content-Type': 'application/json'}
        })
        const result = await response.json()
        console.log(result)
        console.log(formData)
        if(response.ok){
            resMessage.innerHTML =`Password was successfully reset, remeber it now. ${checkMark}\n ${gears} Redirecting to login page...`
            setTimeout( location.pathname = './Login.html',2000)
        }else{
            resMessage.innerHTML =`Error: ${result.message} ${xMark}`
        }
        
    }catch(e){
        resMessage.innerHTML =`Error: ${e.message} ${xMark}`
    }
})