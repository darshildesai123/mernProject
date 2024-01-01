require("dotenv").config();

const express = require("express");
const path = require("path");
const hbs = require("hbs");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/conn");
const Register = require("./models/registers");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));

app.set("view engine", "hbs");

app.set("views", template_path);

hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", auth, (req, res) => {
  console.log(`This is the cookie ${req.cookies.jwt}`);
  res.render("secret");
});

app.get("/logout", auth, async (req, res) => {
  try {
    console.log(req.user);

    // for single logout
    // req.user.tokens = req.user.tokens.filter((currElement) => {
    //   return currElement.token !== req.token;
    // });

    // logout from all devices
    // req.user.tokens = [];

    res.clearCookie("jwt");

    console.log("logout successfully");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

// CRUD Operations
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

// create a new user in our database
app.post("/register", async (req, res) => {
  try {
    // console.log(req.body.firstname);
    // res.send(req.body.firstname);
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    if (password === confirmpassword) {
      const registerEmployee = new Register({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
      });

      console.log("the success part" + registerEmployee);

      const token = await registerEmployee.generateAuthToken();
      console.log("the token part" + token);

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });
      console.log(cookie);

      const registered = await registerEmployee.save();
      res.status(201).render("index");
      // res.status(201).json({status:"succuss",data:registerEmployee});
    } else {
      res.send("Passwords are not matching");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// login check

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);

    const token = await useremail.generateAuthToken();
    console.log("the token part" + token);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
      // secure: true,
    });

    console.log(`This is the cookie ${req.cookies.jwt}`);

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("invalid login details");
    }
  } catch (error) {
    res.status(400).send("invalid login details");
  }
});

// const jwt = require("jsonwebtoken");

// const createToken = async () => {
//   const token = await jwt.sign(
//     { _id: "658e897c64bd47f2852fad29" },
//     "aczqwertyuioplkjhgfdsazxcvbnmkoi",
//     {
//       expiresIn: "2 seconds",
//     }
//   );
//   console.log(token);

//   const userVer = await jwt.verify(token, "aczqwertyuioplkjhgfdsazxcvbnmkoi");
//   console.log(userVer);
// };

// createToken();

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
