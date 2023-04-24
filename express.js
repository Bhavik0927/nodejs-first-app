import express from 'express';
import path from 'path';
import mongoose, { Mongoose } from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';


//We Just connect the database 
mongoose.connect("mongodb://localhost:27017", {
    dbName: "Backend"
}).then(
    () => console.log("DataBase Connected")
).catch((err) => {
    console.log(err);
});


// Create Schema 
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String
});

const DatabaseUser = mongoose.model("User", userSchema);

const app = express();

// Using middleware
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setting a view engine
app.set('view engine', 'ejs');

//login Authenticate function
const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    // if token is present then show logout button;
    if (token) {
        const decodeData = jwt.verify(token, "sadfdjfbsdb");

        req.user = await DatabaseUser.findById(decodeData._id);

        next();
    } else {
        res.redirect("/login")
    }

}

app.get("/", isAuthenticated, (req, res) => {
    res.render("logOut", { name: req.user.name });
});

app.get("/login",(req,res) =>{
    res.render("login");
});

// Register page
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/login",async (req,res) =>{
    const {email,password} = req.body;

    let user = await DatabaseUser.findOne({ email });
    
    if(!user) return res.redirect("/register");

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch) return res.render("login",{email,message:"incorrect password"});


    const token = jwt.sign({ _id: user._id }, "sadfdjfbsdb");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })
    res.redirect("/");

})
 
// Login page
app.post("/register", async (req, res) => {
    
    const { name, email,password } = req.body;
    // check already user is available or not
    let user = await DatabaseUser.findOne({ email });

    //if it doesen't exist it will continuously rotating
    if (user) {
        return res.redirect("/login");
    }

    //becrypt password(So we can't see password in database);
    const hashedPassword = await bcrypt.hash(password,10);  

    // When we login we get a data
    user = await DatabaseUser.create({
        name,
        email,
        password:hashedPassword,
    });

    const token = jwt.sign({ _id: user._id }, "sadfdjfbsdb");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })
    res.redirect("/");
});

// logOut page
app.get("/logOut", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.redirect("/");
});


/*app.get('/Success', (req, res) => {
    res.render("success")
});*/

/*app.get("/users", (req, res) => {
    res.json({
        user
    })
})*/

/*app.post("/contact", async (req, res) => {
    const { name, email } = req.body;

    await Message.create({ name, email });

    res.redirect("/Success");
})*/

app.listen(5000, () => {
    console.log("Listen");
});
