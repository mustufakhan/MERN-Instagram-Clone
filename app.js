const express = require('express')
const app = express()
const mongoose  = require('mongoose')
const PORT = process.env.PORT || 5000
const {MONGOURI} = require('./config/keys')
// const customemiddleware = (req, res, next)=>{
//   console.log("middleware excected!")
//   next()
// }
// app.use(customemiddleware)
// app.get('/home',(req,res)=>{
//   console.log("home!")
//   res.send("hello world")
// })
  
// app.get('/about',customemiddleware,(req,res)=>{
//   console.log("about!")
//   res.send("hello world")
// })

// mongoose.connect(MONGOURI,{
// 	useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('MongoDB Connected...'))
// .catch((err) => console.log(err))
// mongoose.connection.on('connected',()=>{
//   console.log("yes we are connected")
// })
// mongoose.connection.on('error',()=>{
//   console.log("Error")
// })
mongoose.connect(MONGOURI,{
  useNewUrlParser:true,
  useUnifiedTopology: true

})
mongoose.connection.on('connected',()=>{
  console.log("conneted to mongo yeahh")
})
mongoose.connection.on('error',(err)=>{
  console.log("err connecting",err)
})


require('./models/user')
require('./models/post')
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

if(process.env.NODE_ENV=="production"){
  app.use(express.static('client/build'))
  const path = require('path')
  app.get("*",(req,res)=>{
      res.sendFile(path.resolve(__dirname,'client','build','index.html'))
  })
}
  
app.listen(PORT, ()=>{
  console.log("server is running on ",PORT)
})