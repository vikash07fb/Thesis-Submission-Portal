const mongoose = require('mongoose');
const { Schema }= mongoose;


const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    pwd: {
        type:String,
        required:true
    },
    prof:{
        type:Boolean,
        required:true
    }
})

module.exports = mongoose.model('User', UserSchema);