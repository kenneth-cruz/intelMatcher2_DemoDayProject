//Notes// we are using the tools 'required' coming from server.js
module.exports = function(app, passport, db, multer, ObjectId) {

// Image Upload Code =========================================================================
//Notes// On the profile page, we click on the UPLOAD button, which runs the code below.
var storage = multer.diskStorage({
  //Notes// We are establishing the destination of this uploaded picture to be in the public/images/uploads cd
  //Notes// We do this to be able to access it later in our posts/profile/newsFeed.
    destination: (req, file, cb) => {
      cb(null, 'public/post/images/uploads')
    },
    //Notes// Here is how we name each file (distinctly) ... the field name + the time stamp + .png
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
});

//ASK LEON// what this snippet means
var upload = multer({storage: storage});


// normal routes ===============================================================

// show the home page (will also have our login links)
app.get('/', function(req, res) {
    res.render('index.ejs');
});

app.get('/generic', function(req, res) {
        res.render('generic.ejs');
    });

app.get('/favoritesBoard', isLoggedIn, function(req, res) {
  db.collection('topics').find().toArray((err, result) => {
    //reuest to grabbatabase collection named topics,into array
    console.log(req.user.local, 'what')
    // console.log(result, 'booger')
    if (err) return console.log(err)
    //conditional console logged for error
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
    console.log(posterId, 'ZOINKS!!')
    console.log(req.user, 'Person Logged IN!')

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
                    console.log(collectionOne, 'collection1');
                    console.log(collectionOne[0].local, 'wut');
                    console.log(collectionTwo, 'collection2');
                    console.log(req.user, 'WTF');
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










// message board routes ===============================================================
    //Create
    app.post('/messages', (req, res) => {
//creating a message with the username ( email) the message they post, thumbUp and thumbDown and each time you press submit, this is activated and saves to the database
//console.log redirects you back to profile.ejs (refresh)
      let baseUrl = 'http://localhost:3000/profileMessage/';
      // let receiverID =
      // console.log(req, 'meep')
      let senderID = req.user._id
      let bigURL = req.headers.referer;
      let receiverID = ObjectId(bigURL.split(baseUrl)[1]);
      console.log(receiverID, 'receiverID')
      console.log(req.user, 'LMAO')
      db.collection('messages').save({senderID: senderID, receiverID: receiverID, name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        //refreshing the page, which will then display with the latest message added.
        res.redirect('/favoritesBoard')
      })
    })

// INDIVIDUAL POST PAGE =========================
// Question: you told us that zebra in the following two lines can be anything, why does it break if nothing is there.
app.get('/post/:individualPostID', isLoggedIn, function(req, res) {
    let postId = ObjectId(req.params.individualPostID)
    console.log(postId, 'poopy');
    console.log(req.session.passport.user, 'zoinks!!');
    // console.log(req.user, "shmoney")
    console.log(req.params, 'KEYWORD')

    // this is the part that finds only documents with that exact postID which leads to only
    // one picture showing up in post.ejs
    db.collection('topics').find().toArray((err, result) => {
      let keyword;
      result.forEach(topic => {
        if(topic._id.toString() === postId.toString()){
          keyword = topic.keyword;
        }})
      let resultFilteredByKeyword = result.filter(topic => topic.keyword === keyword)
      console.log(keyword, 'water')
      if (err) return console.log(err)
      res.render('post.ejs', {
        topics: resultFilteredByKeyword,
        user: req.user
      })
    })

});



//Change Profile Picture =========================================================================
app.post('/changeProfilePicture', upload.single('file-to-upload'), (req, res, next) => {
  // the uID is the logged in user's Hashed Username.... this is where the connection between
  // The Logged in User ---> Stamping the User's ID onto this Upload they're about to make.
  let uId = ObjectId(req.session.passport.user)
  console.log(req.session.passport.user, 'userID of the logged in user')
  console.log(req.file.filename, 'testfileUploaded')
  let upload = 'images/uploads/' + req.file.filename
  // we are saving a document onto this collection with the following info:
  // the userID of who posted this picture (uID), the caption we wrote for it comming from profile.ejs "caption",
  // the likes starting at 0, // the image path which is [[ASK LEON: where is req.file.filename coming from?]] ... every
  // file uploaded is saved to ATOM so it is reaching for that path as a string to use later.
  db.collection('users').findOneAndUpdate({
      _id: uId}, {
        $set: {profileImg: `post/${upload}` }
      }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    // it refreshes the profile page.
  })
  db.collection('topics').updateMany({
      posterId: uId}, {
        $set: {profileImg: upload }
      }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    // it refreshes the profile page.
  })
  res.redirect('/profile')
});

app.post('/topics', (req, res) => {
//creating a message with the username ( email) the message they post, thumbUp and thumbDown and each time you press submit, this is activated and saves to the database
//console.log redirects you back to profile.ejs (refresh)
  let uId = ObjectId(req.session.passport.user)
  let email = req.user.local.email
  let age = req.user.local.age
  let gender = req.user.local.gender
  let firstName = req.user.local.firstName
  let profileImg = req.user.profileImg

  console.log(email, 'COFFEE')
  console.log(uId)
  db.collection('topics').save({swipeRight: true, posterId: uId, topic:req.body.topic, link: req.body.link, imageSRC: req.body.imageSRC, email: email, age: age, firstName: firstName, gender: gender, keyword: req.body.keyword, profileImg: profileImg}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    //refreshing the page, which will then display with the latest message added.
    res.redirect('/profile')
  })
})


// LOGOUT ==============================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.delete('/zoinks', (req, res) => {
      //deletemethod:Deletes a single document based on the filter and sort criteria, returning the deleted document https://docs.mongodb.com/manual/reference/method/db.collection.findOneAndDelete/
      console.log(req.body, 'body')
      db.collection('posts').findOneAndDelete({
        caption: req.body.caption,
        imgPath: req.body.imgPath
        }, (err, result) => {//looks at messages collection,s finds and deletes.
        if (err) return res.send(500, err)//if error, send error
        res.send('Picture deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
