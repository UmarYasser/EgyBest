const CustomError = require('../Utils/CustomError');
const User = require('./../Models/userModel');
const {asyncErHandler,NormalErrors} = require('./GlobalErrorHandler');
const jwt = require('jsonwebtoken')
const util = require('util')
const crypto = require('crypto')
const Email = require('./../Utils/Email')



const signToken = (id) => {
    return jwt.sign({id:id},process.env.SECRET_STR, {expiresIn: process.env.EXPIRES_IN});
}

const createRes = (user,statusCode,res) =>{
    const token = signToken(user._id);


    const options = {
        maxAge:process.env.EXPIRES_IN,
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.cookie('jwt',token,options)

    console.log('cookie',res.cookies.jwt)
    user.password = undefined

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

const signup = asyncErHandler( async(req,res,next) => {
    if(!req.body.email || !req.body.password){
        return res.status(401).json({
            status:'fail',
            message:"Email & Password are required."
        })
    }

    const user = await User.findOne({email:req.body.email})
    if(user){
        return res.status(401).json({
            status:'fail',
            message:"User with that email already exists."
        })
    }

    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    console.log('User Created!')
//    createRes(token,201,res);
    res.cookie('jwt',token,{
        maxAge:process.env.EXPIRES_IN,
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production' ? true : false
    })
    newUser.password = undefined
    res.status(201).json({
        status:'success',
        token,
        data:{
            user:newUser
        }
    })
})

//$2a$12$jmkSH7Nr8m8rDNkIFPY8H.HFEQ1PBnYDDwhMKdrwIME1osA7YZ52C
const login = asyncErHandler( async(req,res,next) => {    
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(401).json({
            status:'fail',
            message:"Email & Password are required."
        })
    } 
    
    const user = await User.findOne({email:email}).select('+password')
    if(!user){
        return res.status(400).json({
            status:'fail',
            message:"Email or Password are incorrect."
        })
        const err = new CustomError('Wrong Email...',404)
        return next(err)
    }
    
    const isMatch = await user.comparePassword(password,user.password);
    if(!isMatch){
        return res.status(400).json({
            status:'fail',
            message:"Email or Password are incorrect."
        })
        const err = new CustomError('Wrong Password...',404);
        return next(err);
    }
    // createRes(user,200,res);

    const token = signToken(user._id);
    res.cookie('jwt',token,{
        maxAge:process.env.EXPIRES_IN,
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production' ? true : false
    })
    res.status(200).json({
        status:'success',
        data:user
    })
})
// For checking if the user is logged in
const protect = asyncErHandler( async(req,res,next) =>{
    //1. Read the token & check if it exists
    // const testToken = req.headers.authorization;
    
    let token = req.cookies.jwt //|| (testToken && testToken.startsWith('bearer') ? testToken.split(' ')[1] : null);
    // if(testToken && testToken.startsWith('bearer')){
    //     token = testToken.split(' ')[1]; // [0] = bearer, [1] = {the token}
    // } 
     
    if(!token || token === 'loggedout'){
        console.log('token:' + token)
        return next(new CustomError('You are not logged in',401))
    }
     
    //2. Validate Token    
    const decoded = await util.promisify(jwt.verify)(token,process.env.SECRET_STR)
    // Returns the user ID, Time The Token was issued (iat) <= will be used
    //3. Ensure that the user exists
    const user = await User.findById(decoded.id);

    if(!user ) { return next(new CustomError("The User with that token isn't found at the moment",401)) }; 
    
    //4. Check if the Password is changed
    const isChangedAfterIssue = await user.isPasswordChanged(decoded.iat);

    if(isChangedAfterIssue){
        const err = new CustomError('Password Changed! Please Log In Again...',401)
        return next(err);
    }

    //5. Continuing the Stack
    req.user = user
    next()
})

//For Roles
const restrict = (...role) => {
    return (req,res,next) =>{
        if(!role.includes(req.user.role)){
            const err = new CustomError("'You Don't have the permission to perform this action",403);
            return next(err);
        }
        next()
    }
}

const forgotPassword = asyncErHandler(async(req,res,next) =>{
    //1.Get THe User with the given Email
    const user = await User.findOne({email:req.body.email})
    
    if(!user){
        return res.status(400).json({
            status:'fail',
            message:"This Email wasn't found"
        })
        const err = new CustomError("Can't find a user with this email...",401);
        return next(err);
    }
    //2.Generate A Random Token
    const resetToken =  await user.resetPasswordToken();
   
   
    //sSave changes on the user
    await user.save({validateBeforeSave:false})


    function getTimeIn10Minutes() {
        const now = new Date();
        const tenMinutesLater = new Date(now.getTime() + 10 * 60000); // 10 minutes in milliseconds
    
        return tenMinutesLater.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    //3.Send the token back to the User's Email
    const devUrl = `97p7tnf4-3000.uks1.devtunnels.ms`
    const resetUrl = `https://${devUrl}/resetPassword/${resetToken}\n\n`
    const message = `We have recieved a password reset request, Please use the link below the reset it\n\n${resetUrl}This link will only be valid for 10 mins.`
    const html = `
        <!DOCTYPE html>
        <html>
            <body>
                <h3>Password Reset Request</h3>
                <p>We have received a password reset request. Please use the link below to reset it:</p>
                ${resetUrl}
                <p>This link will only be valid for 10 minutes. (${getTimeIn10Minutes()})</p>
            </body>
        </html>
    `
    try{
        await Email.sendEmail({
            email: user.email,
            message:message,
            html:html,
            subject: 'Password Reset Request'
        })

        res.status(200).json({
            status:'success',
            message:'Password Reset link sent'
        })
    }catch(err){
        user.passwordResetToken = undefined;
        user.resetTokenExpires = undefined;

        user.save({validateBeforeSave:false})
        return next( new CustomError('There was a problem sending the email: ' + err.message,500));
    }
})

const resetPassword = asyncErHandler( async(req,res,next) =>{
    //1.Find User with the given Password Reset Token && validate the token
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken:token,resetTokenExpires: {$gt:Date.now()}});
    
    if(!user){
        const err = new CustomError('Token has expired ( Vaild for 10 mins only) ',401);   
        // console.log(`${Date.now()},${new Date(user.resetTokenExpires)}`);
        return next(err)
    }
    
    //2.Set the user's password with the new password
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.resetTokenExpires = undefined;
    user.isChangedAt = Date.now();
    
    user.save();
    
    //3. Log In The User
    const loginToken = signToken(user._id);

    res.status(200).json({
        status:'success',
        token: loginToken
    })

})



module.exports = {signup,login,protect,restrict,forgotPassword,resetPassword}