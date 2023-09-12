const mongoose = require('mongoose');
const mongoURl = "mongodb://localhost:27017/"

const ConnectToMongo = async()=>{
	  await mongoose.connect('mongodb://127.0.0.1:27017/CC');
	  console.log("moongose connected ")
}

module.exports = ConnectToMongo; 

