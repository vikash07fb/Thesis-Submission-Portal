const express = require('express')
var bodyParser = require('body-parser')
const path = require('path')
const connectToMongo = require('./db.js')
const app = express()
require('dotenv').config();
const port = 3000;

//connect to mongodb
connectToMongo();


//make public folder the static directory
app.use(express.static(path.join(__dirname, 'public')));

//endpointss
app.get('/prof', (req, res) => {
  res.sendFile('prof.html', { root: __dirname+'/public' });
})
app.post('/', (req, res) => {
    res.send('Got a POST request')
})
app.get('/student', (req,res)=>{
  res.sendFile('student.html', { root: __dirname+'/public' });
})
app.get('/', (req,res)=>{
  res.sendFile('register.html', { root: __dirname+'/public' });
})
app.get('/login', (req,res)=>{
  res.sendFile('login.html', { root: __dirname+'/public' });
})

//Available Routes
app.use(bodyParser.json({limit: '50mb'})) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
// app.use('/api/auth', require('./routes/auth'))
// app.use('/api/notes', require('./routes/notes'))
app.use('/api/thesis', require('./routes/thesis'));
app.use('/api/auth', require('./routes/auth'));

//listening to port
app.listen(process.env.PORT || port, () => {
  console.log(`Backend listening at http://localhost:${process.env.PORT || port}`)
}) 