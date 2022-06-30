const mongoose = require('mongoose');
const { Schema }= mongoose;


const ThesisSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    roll:{
        type: String,
        required: true
    },
    supervisor_name:{
        type: String,
        required: true
    },
    supervisor_email:{
        type: String,
        required: true
    },
    co_supervisor_name:{
        type: String
    },
    co_supervisor_email:{
        type: String
    },
    thesis_title:{
        type: String,
        required: true
    },
    thesis_abstract:{
        type: String,
        required: true
    },
    thesis_keywords:{
        type: String,
        required: true
    },
    thesis:{
        type: String,
        required: true
    },
    certificate:{
        type: String,
        required: true
    },
    approved:{
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Thesis', ThesisSchema);