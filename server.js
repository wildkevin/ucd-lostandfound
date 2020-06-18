// The server's code
const express = require("express");
const fs = require("fs");
const FormData = require("form-data");
const bodyParser = require("body-parser");

// Start building the server's pipeline
const app = express();

// make all the files in 'public' available
app.use(express.static("public"));

// special case for when we get just the base URL
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

// listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//======================== SEND IMAGE TO ECS162.org ===============================
// Next, serve any images out of the /images directory
app.use("/images", express.static("images"));

// Multer is a module to read and handle FormData objects, on the server side
const multer = require("multer");

// Make a "storage" object that explains to multer where to store the images...in /images
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + "/images");
  },
  // keep the file's original name
  // the default behavior is to make up a random string
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// Use that storage object we just made to make a multer object that knows how to
// parse FormData objects and store the files they contain
let uploadMulter = multer({ storage: storage });

// Next, handle post request to upload an image
// by calling the "single" method of the object uploadMulter that we made above
app.post("/upload", uploadMulter.single("newImage"), function(
  request,
  response
) {
  // file is automatically stored in /images
  // WARNING!  Even though Glitch is storing the file, it won't show up
  // when you look at the /images directory when browsing your project
  // until later.  So sorry.
  console.log(
    "Recieved",
    request.file.originalname,
    request.file.size,
    "bytes"
  );
  // the file object "request.file" is truthy if the file exists
  let filename = "/images/" + request.file.originalname;
  if (request.file) {
    // Always send HTTP response back to the browser.  In this case it's just a quick note.
    sendMediaStore(filename, request, response);
    // response.end("Server recieved "+request.file.originalname);
    filename = "images/" + request.file.originalname;
    fs.unlink(filename, err => {
      if (err) throw err;
      console.log(filename + " was deleted");
    });
  } else throw "error";
});

// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();

    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(
      err,
      APIres
    ) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser
        // module handles for us in Express.
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
          }
        });
      } else {
        // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      } // else
    });
  }
}
//======================== DONE ===============================

//======================== BUILDING DATABASE ===============================
// This creates an interface to the file if it already exists, and makes the 
// file if it does not. 
const sql = require("sqlite3").verbose();
const lfDB = new sql.Database("lostfound.db")

// Actual table creation; only runs if "shoppingList.db" is not found or empty
// Does the database table exist?
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='LostFoundTable' ";
lfDB.get(cmd, function (err, val) {
    console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        createLostFoundDB();
    } else {
        console.log("Database file found");
    }
});

function createLostFoundDB() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE LostFoundTable ( id TEXT PRIMARY KEY UNIQUE, type TEXT, title TEXT, \
    category TEXT, description TEXT, photoURL TEXT, time NUMERIC, location TEXT)';
  lfDB.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}
//======================== DONE ===============================

//======================== INSERT ITEM INFO ===============================
app.post("/itemNext", express.json(), function(request, response, next) {
  console.log("Info part one recieved!", request.body)
  let lfId = Math.random().toString(36).substr(2, ) + Math.random().toString(36).substr(2, )
  let lfType = request.body.type;
  let lfTitle = request.body.title;
  let lfCateg = request.body.category;
  let lfDescr = request.body.description;
  let lfImage = request.body.image;
  let lfTime = 0
  let lfLoc = ""
  cmd = "INSERT INTO LostFoundTable (id, type, title, category, description, photoURL, time, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  lfDB.run(cmd, lfId, lfType, lfTitle, lfCateg, lfDescr, lfImage, lfTime, lfLoc, function(err) {
    if (err) {
      console.log("DB insert error",err.message)
      next()
    } else {
      response.send(lfId);
    }
  })
})

app.post("/itemSubmit", express.json(), function(request, response, next) {
  console.log("Info part two recieved!", request.body)
  let lfId = "\"" + request.body.itemid + "\"";
  let lfTime = request.body.time;
  let lfLoc = request.body.loc;
  cmd = "UPDATE LostFoundTable SET time = " + lfTime.toString() + ", location = '" + lfLoc + "' WHERE id = " + lfId
  console.log(cmd)
  lfDB.run(cmd, function(err) {
    if (err) {
      console.log("DB update error",err.message)
      next()
    } else {
      response.send(lfId);
    }
  })
})
//======================== DONE ===============================

//======================== Google Login ===============================
// New modules related to doing the login process
const request = require("request"); // we'll need this later

// and some new ones related to doing the login process
const assets = require("assets");
const passport = require("passport");
// There are other strategies, including Facebook and Spotify
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

// Setup passport, passing it information about what we want to do
passport.use(
  new GoogleStrategy(
    // object containing data to be sent to Google to kick off the login process
    // the process.env values come from the key.env file of your app
    // They won't be found unless you have put in a client ID and secret for
    // the project you set up at Google
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // CHANGE THE FOLLOWING LINE TO USE THE NAME OF YOUR APP
      callbackURL: "https://cool-ucd-lostandfound.glitch.me/auth/accepted",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // where to go for info
      scope: ["email"] // the information we will ask for from Google
    },

    // function to call to once login is accomplished, to get info about user from Google;
    // it is defined down below.
    gotProfile
  )
);

// Start setting up the Server pipeline

console.log("setting up pipeline");

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({ extended: true }));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// Now some stages that decrypt and use cookies

// express handles decryption of cooikes, storage of data about the session,
// and deletes cookies when they expire
app.use(
  expressSession({
    secret: "bananaBread", // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  })
);

// Initializes request object for further handling by passport
app.use(passport.initialize());

// If there is a valid cookie, will call passport.deserializeUser()
// which is defined below.  We can use this to get user data out of
// a user database table, if we make one.
// Does nothing if there is no cookie
app.use(passport.session());

// The usual pipeline stages

// Public files are still serverd as usual out of /public
app.get("/*", express.static("public"));

// special case for base URL, goes to index.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// Glitch assests directory
app.use("/assets", assets);

// stage to serve files from /user, only works if user in logged in

// If user data is populated (by deserializeUser) and the
// session cookie is present, get files out
// of /user using a static server.
// Otherwise, user is redirected to public splash page (/index) by
// requireLogin (defined below)
app.get("/user/*", requireUser, requireLogin, express.static("."));

// Now the pipeline stages that handle the login process itself

// Handler for url that starts off login with Google.
// The app (in public/index.html) links to here (note not an AJAX request!)
// Kicks off login process by telling Browser to redirect to Google.
app.get("/auth/google", passport.authenticate("google"));
// The first time its called, passport.authenticate sends 302
// response (redirect) to the Browser
// with fancy redirect URL that Browser will send to Google,
// containing request for profile, and
// using this app's client ID string to identify the app trying to log in.
// The Browser passes this on to Google, which brings up the login screen.

// Google redirects here after user successfully logs in.
// This second call to "passport.authenticate" will issue Server's own HTTPS
// request to Google to access the user's profile information with the
// temporary key we got from Google.
// After that, it calls gotProfile, so we can, for instance, store the profile in
// a user database table.
// Then it will call passport.serializeUser, also defined below.
// Then it either sends a response to Google redirecting to the /setcookie endpoint, below
// or, if failure, it goes back to the public splash page.
// app.get(
//   "/auth/accepted",
//   passport.authenticate("google", {
//     successRedirect: "/setcookie",
//     failureRedirect: "/"
//   })

// );

app.get(
  "/auth/accepted",
  passport.authenticate("google", {
    successRedirect: "/setcookie",
    failureRedirect: "/?cause=loginFailed",
  })
  
  
);


app.get('/', (req, res) => {
  res.redirect("user/main.html");
  console.log(req.query.name);
  console.log("!!!!!!!!!!!!!!!!!", req.query.cause);
    if (req.query.cause ==="loginFailed") {
      res.redirect("user/main.html");
      console.log(req.flash("Login with your UC Davis email account"));
      alert("Login with your UC Davis email account");
    }
})

// One more time! a cookie is set before redirecting
// to the protected homepage
// this route uses two middleware functions.
// requireUser is defined below; it makes sure req.user is defined
// the second one makes a public cookie called
// google-passport-example
app.get("/setcookie", requireUser, function(req, res) {
  // if(req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){
  // mark the birth of this cookie

  // set a public cookie; the session cookie was already set by Passport
  res.cookie("google-passport-example", new Date());
  console.log("hello");
  res.redirect("user/main.html");
  //} else {
  //   res.redirect('/');
  //}
});

// currently not used
// using this route, we can clear the cookie and close the session
app.get("/user/logoff", function(req, res) {
  // clear both the public and the named session cookie
  res.clearCookie("google-passport-example");
  res.clearCookie("ecs162-session-cookie");
  res.redirect("/");
});

// listen for requests :)

// Some functions called by the handlers in the pipeline above

// Function for debugging. Just prints the incoming URL, and calls next.
// Never sends response back.
function printIncomingRequest(req, res, next) {
  console.log("Serving", req.url);
  if (req.cookies) {
    console.log("cookies", req.cookies);
  }
  next();
}

// function that handles response from Google containint the profiles information.
// It is called by Passport after the second time passport.authenticate
// is called (in /auth/accepted/)
function gotProfile(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);

  // here is a good place to check if user is in DB,
  // and to store him in DB if not already there.
  // Second arg to "done" will be passed into serializeUser,
  // should be key to get user out of database.

  let dbRowID = 3; // temporary! Should be the real unique
  // key for db Row for this user in DB table.
  // Note: cannot be zero, has to be something that evaluates to
  // True.
  const providerData = profile._json;
  //console.log("---------------", providerData, "-----------------");
  if (providerData.hd == "ucdavis.edu") {
    done(null, profile.id);
  } else {
    done(null, 0);
    request.get(
      "https://accounts.google.com/o/oauth2/revoke",
      {
        qs: { token: accessToken }
      },
      function(err, res, body) {
        console.log("revoked token");
      }
    );
  }
}

// Part of Server's sesssion set-up.
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie.
// For instance, if there was some specific profile information, or
// some user history with this Website we pull out of the user table
// using dbRowID.  But for now we'll just pass out the dbRowID itself.
passport.serializeUser((dbRowID, done) => {
  console.log("SerializeUser. Input is", dbRowID);
  done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie (so, while user is logged in)
// This time,
// whatever we pass in the "done" callback goes into the req.user property
// and can be grabbed from there by other middleware functions
passport.deserializeUser((dbRowID, done) => {
  console.log("deserializeUser. Input is:", dbRowID);
  // here is a good place to look up user data in database using
  // dbRowID. Put whatever you want into an object. It ends up
  // as the property "user" of the "req" object.
  let userData = { userData: "maybe data from db row goes here" };
  done(null, userData);
});

function requireUser(req, res, next) {
  console.log("require user", req.user);
  if (!req.user) {
    res.redirect("/");
  } else {
    console.log("user is", req.user);
    next();
  }
}

function requireLogin(req, res, next) {
  console.log("checking:", req.cookies);
  if (!req.cookies["ecs162-session-cookie"]) {
    res.redirect("/");
  } else {
    next();
  }
}
//======================== DONE =====================================

//======================= SEARCH DATABASE ===========================
app.post("/itemSearch", express.json(), function(request, response, next) {
  console.log("Start searching database", request.body)
  let searchType = request.body.type
  let start_time = request.body.start
  let end_time = request.body.end
  let search_cate = request.body.category
  let search_loc = request.body.location
  let cmd = generateCMD(searchType, start_time, end_time, search_cate, search_loc)
  console.log("cmd to execute: " + cmd)
  lfDB.all(cmd, function (err, rows) {
    if (err) {
      console.log("Database reading error", err.message)
      next();
    } else {
      // send shopping list to browser in HTTP response body as JSON
      response.json(rows);
    }
  });
})

function generateCMD(searchType, start_time, end_time, search_cate, search_loc) {
  let cmd = "SELECT * FROM LostFoundTable WHERE type='" + searchType + "' AND ("
  let timeCmd = ""
  if (start_time != 0 && end_time != 0) {
    timeCmd = "time BETWEEN " + start_time.toString() + " AND " + end_time.toString()
  }
  let catCmd = ""
  if (search_cate != "") {
    catCmd = "category = '" + search_cate + "'"
  }
  let locCmd = ""
  if (search_loc != "") {
    locCmd = "location = '" + search_loc + "'"
  }
  let tmpSet = [timeCmd, catCmd, locCmd]
  let cmdSet = []
  for (let i = 0; i < tmpSet.length; i++) {
    if (tmpSet[i] != "") {
      cmdSet.push(tmpSet[i])
    }
  }
  for (let i = 0; i < cmdSet.length; i++) {
    cmd = cmd + cmdSet[i]
    if (i != cmdSet.length - 1) {
      cmd = cmd + " OR "
    } else {
      cmd = cmd + ")"
    }
  }
  return cmd
}
//======================== DONE ===============================
