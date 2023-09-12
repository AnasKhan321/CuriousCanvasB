const express = require('express')
const app = express()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('./middleware/middleware')
const { validationResult, body } = require('express-validator')
const ConnectToMongo = require('./db')
const port = 3000
const multer = require('multer');
const cors = require('cors');
const User = require('./umodel');
const Blog = require('./blog'); 
const Comment = require('./cmodel')
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json())


app.use(cors({
  origin: 'http://localhost:8000',
  // You can configure other CORS options as needed
}));
app.use(express.urlencoded())

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Store uploaded files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middleware to serve static files from the "uploads" directory
app.use(express.static('uploads'));


ConnectToMongo();


app.post('/createuser', [

  body('name', 'You Enter invalid Name').isLength({ min: 5 }),
  body('password', 'your password is too short').isLength({ min: 8 }),
  body('email', 'Enter valid email ').isEmail()

], async (req, res) => {
  const errors = validationResult(req);
  console.log(req.body)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  else {

    try {

      const user = await User.findOne({ email: req.body.email })
      if (user) { res.status(400).json({ messagee: "user with this email already exists" }) }
      else {

        let salt = await bcrypt.genSaltSync(10);
        let hash = await bcrypt.hashSync(req.body.password, salt);
        let secpass = hash;
        // Create the user 
        const user = await User.create({
          name: req.body.name,
          password: secpass,
          email: req.body.email
        })

        const data = {
          User: {
            id: user.id
          }
        }
        var token = jwt.sign(data, 'shhhhh');
        res.json({ auth: token })

      }

    } catch (error) {

      res.json({ error: "Something error happening" })
    }
  }

})
app.post('/login', [

  body('password', 'Password Cannot be Blank ').exists(),
  body('email', 'Enter valid email ').isEmail()

], async (req, res) => {
  console.log('request i shere ')
  const errors = validationResult(req);
  let success = false;
  console.log(req.body)

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: success })
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(500).json({ error: "Please try to login with correct email", success: success })
    }

    const passwordCompare = await bcrypt.compare(password, user.password)

    if (!passwordCompare) {
      return res.status(500).json({ error: "Please try to login with correct password", success: success })

    }
    const data = {
      User: {
        id: user.id
      }
    }
    var token = jwt.sign(data, 'shhhhh');
    success = true;
    res.json({ auth: token })



  } catch (error) {
    res.status(500).json({ "message": error.message, success: success });
  }
})


app.post('/getuser', fetchuser, async (req, res) => {

  try {
    userId = req.user.id;
    console.log(userId)
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    res.status(500).json({ "message": error.message });

  }


})


app.post('/addblog', upload.single('file'), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  let token = req.body.auth;
  const data = jwt.verify(token, 'shhhhh')
  console.log(data.User)

  const blog = Blog.create({

    AuthorName: req.body.author,
    title: req.body.title,
    filename: req.file.filename,
    article: req.body.content,
    userid: data.User.id
  })

  res.json({ "message": "this is message " });


})

app.post('/postcomment' , async(req,res)=>{

  let body = req.body ; 
  console.log(body)
  const data = jwt.verify(body.token, 'shhhhh')
  console.log(data.User)
  const user = await User.findOne({_id : data.User.id })
  console.log(user.name)
  const comment1 =  Comment.create({
    username : user.name,
    blogid : body.blogid,
    comment : body.comment
  })
  
  res.json({'message' : 'this is message'})

})

app.get('/myblog' , async(req,res)=>{
  let query = req.originalUrl.split('=')[1]
  console.log(query)
  const data = jwt.verify(query, 'shhhhh')
  console.log(data.User)

  const blogs = await Blog.find({userid : data.User.id })
  console.log(blogs)
  res.json({ 'blogs': blogs })


})

app.get('/allblog', async (req, res) => {
  const Blogs = await Blog.find();
  console.log(Blogs)
  res.json({ 'blogs': Blogs })
})


app.get('/searchblog' , async(req,res)=>{
  let query = req.originalUrl.split('=')[1]
  console.log(query)

  const Blogs = await Blog.find({"title" : {$regex : query} , "article" : {$regex : query}})
  console.log(Blogs)
  res.json({ 'blogs': Blogs })
})

app.get('/getblog', async (req, res) => {
  let query = req.originalUrl.split('=')[1]
  const Blogs = await Blog.findOne({ _id :  query });
  console.log(Blogs.views)
  Blogs.views+=1 ; 
  Blogs.save(); 
  const comment = await Comment.find({blogid : Blogs._id })
  console.log(comment)
  console.log(req.originalUrl.split('='))
  res.json({ 'blogs': Blogs , 'comment' : comment })
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



