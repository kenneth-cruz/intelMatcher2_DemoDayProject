const express  = require('express');
const app      = express();
const port     = process.env.PORT || 3000;
const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');
const multer = require('multer');
const ObjectId = require('mongodb').ObjectID

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');

const configDB = require('./config/database.js');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  connect(database)
});

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs');

require('./config/passport')(passport);
app.use(session({
    secret: 'rcbootcamp2019c',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


const connect = (db) => require('./app/routes.js')(app, passport, db, multer, ObjectId);


app.listen(port);
console.log('The magic happens on port ' + port);
