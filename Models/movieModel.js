const { writeFileSync } = require('fs')
const mongoose = require('mongoose')
const path = require('path')

mongoose.set('autoIndex',true)

const movieSchema = new mongoose.Schema({
    name:{
        type: String, 
        unique: true,
        required: [true,"Name is Required.."],
        trim:true,
        select:true,
        minlength:[4,'Name must have between 4 and 20 letters'],
        maxlength:[45,'Name must have between 4 and 45 letters']
    }, 
    releaseYear:{
        type: String,
        required: [true,"Release Year is Required.."],
    },
    duration: Number,
    description:String,
    rating: {
        type: Number,
        //default: 1.0,
        required: [true,'Rating is required'],
        validate:{
            validator:function(v){
            return v >=1 && v <=10;
        },
            message:'Ratings must be between 1 & 10 only'
        },
    },
    totalRating: {
        type: Number
    },
    releaseDate:{
        type: Date,
    },
    createdAt:{
        type:Number,
        default: Date.now(),
        select:false
    },
    type:{
        type:String,
        enum:['movie','series','theater'],
        required:[true,'The type is required']
    },
    genres:{
        type: Array,
        required: [true,"Genres are Required"],
    },
    directors:{
        type: Array,
        required: [true,"Directors are Required"]
    },
    actors:{
        type:Array,
    },
    coverImage: {
        type:String,
        default:path.join(__dirname,'..','Public','Images','Posters','generic.jpg')
    },
    trailerUrl:String,
    videoUrl:String,
    price: Number,
    createdBy:String
},{
    toJSON:{virtuals:false},
    toObjects: {virtuals:false}
})

movieSchema.virtual('durationH').get(function(){
    console.log(this.duration)
    return (this.duration/60).toFixed(1)
})

movieSchema.pre('save',function(next){
    this.createdBy = 'UmarYasser';
    next();
})
movieSchema.post('save',function(doc,next){
    const content=`The movie ${doc.name} was added by ${doc.createdBy}\n`;
    writeFileSync('./Data/counter.txt',content,{flag:'a'},(err) =>{
        console.log(err.message);
    })
    next();
})

movieSchema.pre(/^find/,function(next){
    // this.find({releaseDate : {$lte: Date.now()}})  
    this.startTime = Date.now();
    next()
})

movieSchema.post(/^find/,function(doc,next){
    this.endTime = Date.now();
    const content = `A Query took ${this.endTime - this.startTime} ms to finish\n`;
    writeFileSync('./Data/counter.txt',content,{flag:'a'},(err)=>{
        console.log(err);
    })
    next()
})

movieSchema.pre('aggregate',function(next){
    this.pipeline().unshift({$match: {releaseDate: {$lte : new Date()}}})
    next();
})
const Movie = mongoose.model('Movies',movieSchema,'Movies');


module.exports = Movie
