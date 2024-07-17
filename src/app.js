const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const app = express();

require("./db/conn");
const Register = require("./models/register");

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "../public");
const tempPath = path.join(__dirname, "../templates");

const partPath = path.join(__dirname, "../templates/partials");
  
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(publicPath));
app.set("view engine", "hbs");
app.set("views", tempPath);
hbs.registerPartials(partPath);

console.log(tempPath);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("index");
});

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;

        if (password === cpassword) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new Register({
                fullName: req.body.fullName,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: hashedPassword,
                confirmPassword: hashedPassword,
                declaration: req.body.declaration === 'on'
            });

            await newUser.save();
            res.status(201).render("index", { message: "Registration is completed" });
        } else {
            res.render("index", { message: "Passwords do not match" });
        }
    } catch (error) {
        if (error.code === 11000) { // Handle duplicate email error
            res.render("index", { message: "Email already registered" });
        } else {
            res.status(400).send(error);
        }
    }
});   

app.listen(port, () => {
    console.log(`Server is running at port number ${port}`);
});
    