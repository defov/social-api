const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer')
const path = require('path');

dotenv.config();

const authRoute = require('./routes/auth')
const usersRoute = require('./routes/users')
const postsRoute = require('./routes/posts')
const conversationsRoute = require('./routes/conversations')
const messagesRoute = require('./routes/messages')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}, () => {
    console.log('Connected to MongoDB!');
})

app.use('/images', express.static(path.join(__dirname, 'public/images')));

//middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("common"));

app.get("/", (req, res) => {
    res.send('Hello world!')
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    }, 
    filename: (req, file, cb) => { 
        console.log(req.body.name)
        cb(null, req.body.name);
    }
})
const upload = multer({ storage });
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        res.status(200).json('File uploaded successfully.')
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
})

app.use('/api/auth', authRoute)
app.use('/api/users', usersRoute)
app.use('/api/posts', postsRoute)
app.use('/api/conversations', conversationsRoute)
app.use('/api/messages', messagesRoute)

app.listen(9000, () => {
    console.log('Backend server is running!');
});