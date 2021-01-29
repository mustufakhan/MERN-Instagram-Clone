
if(process.env.NODE_ENV==='production'){
  module.exports = require('./pro')
}else{
  module.exports = require('./dev')
}