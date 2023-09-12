const  jwt = require('jsonwebtoken');

const fetchuser  = (req,res,next)=>{
	const token = req.get('auth-token');
	if(!token){
		res.status(500).json({token : "token not found "})
	}
	try{
		const data = jwt.verify(token,'anas')
		req.user = data.User
		next(); 
	}catch(error){
		res.status(401).send("Please autenticate with valid token ")
	}
}

module.exports = fetchuser