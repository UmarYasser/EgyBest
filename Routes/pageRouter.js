const router = require("express").Router();
const fs = require("fs");

const Login = fs.readFileSync("./EgyBest/Public/Pages/Login.html");
const Signup = fs.readFileSync("./EgyBest/Public/Pages/Signup.html");
const Theater = fs.readFileSync("./EgyBest/Public/Pages/Theater.html");
const Movie = fs.readFileSync("./EgyBest/Public/Pages/Movie.html");


const notFound = fs.readFileSync("./EgyBest/Public/Pages/404.html");
const resetPassword=  fs.readFileSync("./EgyBest/Public/Pages/resetPassword.html");

router.get("/(Login(.html)?)?", (req, res) => {
  res.setHeader("Content-Type",'text/html')
  res.end(Login)
});

router.get("/Signup(.html)?", (req, res) => {
  res.setHeader("Content-Type",'text/html')
  res.end(Signup)
});

router.get("/Theater(.html)?", (req, res) => {
  res.setHeader("Content-Type",'text/html')
  res.end(Theater)
});

router.get("/movie/:movieId?", (req, res) => {
  res.setHeader("Content-Type",'text/html')
  res.end(Movie)
});

router.get("/resetPassword/:token", (req, res) => {
  res.setHeader("Content-Type",'text/html')
  res.end(resetPassword)
})

router.get('*',(req,res)=>{
    res.setHeader("Content-Type",'text/html')
    res.end(notFound)
})

module.exports = router
