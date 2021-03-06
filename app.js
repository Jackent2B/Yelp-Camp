var express                    =require("express"),
    app                         =express(),
    bodyParser                  =require("body-parser"),
    mongoose                    =require("mongoose"),
    passport                    =require("passport"),
    LocalStrategy               =require("passport-local"),
    passportLocalMongoose       =require("passport-local-mongoose"),
    flash						=require("connect-flash"),
    Camp                        =require("./models/campgrounds"),
    Comment                     =require("./models/comment"),
    methodOverride				=require("method-override"),
    seedDB                      =require("./seeds"),
    User                        =require("./models/user");

var PORT = process.env.PORT || 3000;

// to connect with different routes files.
var campRoutes                  =require("./routes/campRoutes"),
    commentRoutes               =require("./routes/commentRoutes"),
    authRoutes                  =require("./routes/authRoutes");

//seedDB(); //seed the database
// to create a new database
//process.env.databaseURL
//here DATABASEURL is the key value which we have changed on www.heroku.com of this app domain in settings field config var. 
var url = process.env.DATABASEURL || "mongodb://localhost/yelpcamp";
//process.env.DATABASEURL is corresponding to "mongodb://jayant:yelpcamp@yelpcamp-shard-00-00-gs6ov.mongodb.net:27017,yelpcamp-shard-00-01-gs6ov.mongodb.net:27017,yelpcamp-shard-00-02-gs6ov.mongodb.net:27017/test?ssl=true&replicaSet=yelpcamp-shard-0&authSource=admin&retryWrites=true&w=majority".

mongoose.connect(url,{useNewUrlParser: true});
//it is for running in the machine locally.
//mongoose.connect("mongodb://localhost/yelpcamp",{useNewUrlParser: true});
//it is for running on heroku.
//its value i.e. mongodb://jayant:yelpcamp@yelpcamp-shard-00-00-g.... we have got from MongoDbAtlas.
//mongoose.connect("mongodb://jayant:yelpcamp@yelpcamp-shard-00-00-gs6ov.mongodb.net:27017,yelpcamp-shard-00-01-gs6ov.mongodb.net:27017,yelpcamp-shard-00-02-gs6ov.mongodb.net:27017/test?ssl=true&replicaSet=yelpcamp-shard-0&authSource=admin&retryWrites=true&w=majority",{useNewUrlParser: true});
//to use put and delete method
app.use(methodOverride("_method"));

//to use flash messages
app.use(flash());

//PassPort Configuration.
app.use(require("express-session")({
    secret: "I am gonna make it to the best ",
    resave: false,
    saveUninitialized: false
}));

//to use passport i.e authentication
app.use(passport.initialize());
app.use(passport.session());

// coding and encoding of data i.e encryption.
// note: .authenticate() comes with passportLocalMongoose.
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this is to assign "currentUser: req.user" to all the campgrounds so that if-else statement can work perfectly which is present in header.ejs file.
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.success     = req.flash("success");  
    res.locals.error       = req.flash("error");
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
// to use css file we use the below code
app.use(express.static("public"));

// to use routes files, we need to write these "use" command.
app.use(campRoutes);
app.use(authRoutes);
app.use(commentRoutes);

// SCHEMA SETUP

// var campgroundSchema = new mongoose.Schema({
// 	name: String,
// 	image: String,
// 	description: String
// });

// // assigning a variable

// var Camp = mongoose.model("Camp", campgroundSchema);

// Camp.create({
// 	         name:"hulker",
//              image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwcCaxq2RkGYvD2JHf9EPz-srh-vZhdLOBdf6NXDWRqBWPqoA_",
//              description: "This is a great place to Live"
//             }, function(err, camp){
//             	if (err){
//             		console.log(err);
//             	}else {
//             		console.log("Newly Created Campground:");
//             		console.log(camp);
//             	}
//             });

    // var camp=[
    //     {name:"jaky", image:"data:image/jpeg;base64,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"},
    //     {name:"show's hill", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4rADKG3GNEMHmYk8sT1jsYmA0uC4t9i7ZmbJ4VjZUJi770Vr5pw"},
    //     {name:"hulker", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwcCaxq2RkGYvD2JHf9EPz-srh-vZhdLOBdf6NXDWRqBWPqoA_"}
        
    //     ];

// app.get("/",function(req,res){
//     res.render("landing");
// });

// // CREATE- add new campgrounds to database
// app.post("/camp",isLoggedIn,function(req,res){
    
//     // we want to get data from form and add ot to camp array.
//     var name=req.body.name;
//     var image=req.body.image;
//     var desc=req.body.description;
//     var newcamp={name:name, image:image , description: desc};
//     // camp.push(newcamp);
//     // create a new campground and save it to database
//     Camp.create(newcamp, function(err,newlyCreated){
//     	if(err){
//     		console.log(err);
//     	} else {
//     		// redirect to camp page
//     		res.redirect("/camp");
//     	}

//     });
    
//     // yes we have two camp routes but by default it will be treated as get route in redirect
// });

// // INDEX-show all campgrounds
// app.get("/camp",function(req,res){
// 		// Get all campgrounds from DB
// 		Camp.find({},function(err, allCamp){
// 			if(err){
// 				console.log(err);
// 			} else{
// 				res.render("camp",{camp: allCamp, currentUser: req.user});
// 			}
// 		});
// });

// // NEW -show form to create new campgrounds
// app.get("/camp/new",isLoggedIn,function(req,res){
//     res.render("new.ejs");
// });

// // note that /camp/new should be declared first before /camp/:id as otherwise /camp/:id will treat /camp/new as a name of id(i.e. new).
// app.get("/camp/:id",function(req,res){
// 	// find the campground with provided ID
// 	Camp.findById(req.params.id).populate("comments").exec(function(err,foundCamp){
// 		if(err){
// 			console.log(err);

// 		}else{
//             console.log("foundCamp");
//             // render show template with that campgrounds
// 			res.render("show",{camp: foundCamp});

// 		}
// 	});
	
// });


// // ======================
// // COMMENT ROUTES
// // ======================
// app.get("/camp/:id/comments/new",isLoggedIn,function(req,res){
//     // find camp through id
//     Camp.findById(req.params.id, function(err, camp){
//         if(err)
//             console.log(err);
//         else
//             res.render("newComment.ejs",{camp: camp});
//     });
// });


// app.post("/camp/:id/comments",isLoggedIn,function(req,res){
//     Camp.findById(req.params.id, function(err,camp){
//         if(err){
//             console.log(err);
//             res.redirect("/camp");
//         }
//         else{
//             var writer= req.body.writer;
//             var text= req.body.text;
//             var newcomment ={text: text,writer: writer};
//             Comment.create(newcomment, function(err,newcomment){
//                 if(err){
//                     console.log(err);

//                 } else {
//                     camp.comments.push(newcomment);
//                     camp.save();
//                     res.redirect("/camp/" + camp._id);
//                 }

//             });
//          }

//     });
// });

// //===========
// //AUTH ROUTES
// //===========



// //Register Routes

// // show sign up form
// app.get("/register", function(req,res){
//     res.render("register.ejs");
// });

// // handling user sign up 
// app.post("/register",function(req,res){
//         var newUser = new User({username: req.body.username});

//         User.register(new User({username: req.body.username}),req.body.password,function(err, user){
//             if(err){
//                 console.log(err);
//                 return res.render("register");
//             }
//             passport.authenticate("local")(req, res, function(){
//                 res.redirect("/camp");
//             });
//         });
// });


// //Login Routes
// app.get("/login",function(req,res){
//     res.render("login.ejs");
// })

// app.post("/login",passport.authenticate("local",
//     {successRedirect: "/camp",
//      failureRedirect: "/login"
//     }),function(req,res){

// });


// // LOGOUT routes

// app.get("/logout",function(req,res){
// // .logout() is a pre-defined function in passport.
//     req.logout();
//     res.redirect("/camp");
// });

// function isLoggedIn(req, res, next){
// // it will check whether the user is logged in or not.
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }




app.listen(PORT,process.env.IP,function(){
        console.log("server has started ");
});