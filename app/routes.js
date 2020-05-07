module.exports = function(app, passport, db, multer, ObjectId) {

// Image Upload  =========================================================================
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/post/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
});

var upload = multer({storage: storage});


// normal routes ===============================================================

app.get('/', function(req, res) {
    res.render('index.ejs');
});

app.get('/generic', function(req, res) {
        res.render('generic.ejs');
    });

app.get('/favoritesBoard', isLoggedIn, function(req, res) {
  db.collection('topics').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('favoritesBoard.ejs', {
      user: req.user,
      topics: result
    })
  })

});

// PROFILE SECTION =========================
app.get('/profile', isLoggedIn, function(req, res) {
    let uId = ObjectId(req.session.passport.user)
    db.collection('posts').find({'posterId': uId}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user : req.user,
        posts: result
      })
    })
});

// MESSAGE RECIEPT SECTION =========================
var collectionOne = [];
var collectionTwo = [];
app.get('/profileMessage/:posterID', isLoggedIn, function(req, res) {
    let posterId = ObjectId(req.params.posterID)
    let uId = ObjectId(req.session.passport.user)

    ///collection 1
    let query1 = db.collection('users').find({_id: posterId}).toArray((err, result) => {
      if (err) console.log(err);
      else{
        for (i=0; i<result.length; i++) {
              collectionOne[i] = result[i];
            }

            /// collection 2
            let query2 = db.collection('messages').find({senderID: uId}).toArray((err, result) => {
              if (err) console.log(error);
              else{
                for (i=0; i<result.length; i++) {
                      collectionTwo[i] = result[i];
                    }
                    res.render('profileMessage.ejs', {
                      collectionOne: collectionOne,
                      collectionTwo: collectionTwo,
                      present: req.user
                    });
                  }
                });
          }
    });
  });

    //Favorites Board Post
    app.post('/messages', (req, res) => {
      let baseUrl = 'http://localhost:3000/profileMessage/';
      let senderID = req.user._id
      let bigURL = req.headers.referer;
      let receiverID = ObjectId(bigURL.split(baseUrl)[1]);
      db.collection('messages').save({senderID: senderID, receiverID: receiverID, name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/favoritesBoard')
      })
    })

// INDIVIDUAL POST PAGE =========================
app.get('/post/:individualPostID', isLoggedIn, function(req, res) {
    let postId = ObjectId(req.params.individualPostID)
    db.collection('topics').find().toArray((err, result) => {
      let keyword;
      result.forEach(topic => {
        if(topic._id.toString() === postId.toString()){
          keyword = topic.keyword;
        }})
      let resultFilteredByKeyword = result.filter(topic => topic.keyword === keyword)
      if (err) return console.log(err)
      res.render('post.ejs', {
        topics: resultFilteredByKeyword,
        user: req.user
      })
    })

});



//Change Profile Picture =========================================================================
app.post('/changeProfilePicture', upload.single('file-to-upload'), (req, res, next) => {
  let uId = ObjectId(req.session.passport.user)
  let upload = 'images/uploads/' + req.file.filename
  db.collection('users').findOneAndUpdate({
      _id: uId}, {
        $set: {profileImg: `post/${upload}` }
      }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
  })
  db.collection('topics').updateMany({
      posterId: uId}, {
        $set: {profileImg: upload }
      }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
  })
  res.redirect('/profile')
});

app.post('/topics', (req, res) => {
  let uId = ObjectId(req.session.passport.user)
  let email = req.user.local.email
  let age = req.user.local.age
  let gender = req.user.local.gender
  let firstName = req.user.local.firstName
  let profileImg = req.user.profileImg
  db.collection('topics').save({swipeRight: true, posterId: uId, topic:req.body.topic, link: req.body.link, imageSRC: req.body.imageSRC, email: email, age: age, firstName: firstName, gender: gender, keyword: req.body.keyword, profileImg: profileImg}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
})


// LOGOUT ==============================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.delete('/zoinks', (req, res) => {
      db.collection('posts').findOneAndDelete({
        caption: req.body.caption,
        imgPath: req.body.imgPath
        }, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Picture deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/login',
            failureFlash : true
        }));

        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile',
            failureRedirect : '/signup',
            failureFlash : true
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================

    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
