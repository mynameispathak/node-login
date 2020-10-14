if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const initializePassport = require('./passport-config');
const { urlencoded } = require('body-parser');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = [{ id: '10', name: 'admin', email: 'admin@a', group: 'students', password: '$2b$10$6iUc/TFLNsIUYZJUb2mV1uq2iKIXPtehthbxm6pG3n/kPbKHI/ha.' }];
// const teachers = [{ id: '11', category: 'teachers', name: 'admin', email: 'admin@a', password: '$2b$10$6iUc/TFLNsIUYZJUb2mV1uq2iKIXPtehthbxm6pG3n/kPbKHI/ha.' }];
// const parents = [{ id: '13', category: 'parents', name: 'admin', email: 'admin@a', password: '$2b$10$6iUc/TFLNsIUYZJUb2mV1uq2iKIXPtehthbxm6pG3n/kPbKHI/ha.' }];



app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false //dont save empty value in session
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, function (req, res) {
    res.render('index.ejs', { name: req.user.name });
});

app.get('/login', checkNotAuthenticated, function (req, res) {
    res.render('login.ejs');
});

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.post('/login', urlencodedParser, checkNotAuthenticated, passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        if (req.body.group === 'student') {
            res.redirect('/student');
        }
        else if (req.body.group === 'teacher') {
            res.redirect('/teacher');
        }
        else if (req.body.group === 'parent') {
            res.redirect('/parent');
        }
    }
);
// successRedirect: '/',
// ,
// failureFlash: true
// if(req.user.category === 'student') {
// res.redirect('/student');
//         })
//     }
// }
// );

app.get('/register', checkNotAuthenticated, function (req, res) {
    res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async function (req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // const cat = req.body.category;
        // if (cat === student) {
        //     students.push({
        //         id: Date.now().toString(),
        //         name: req.body.name,
        //         email: req.body.email,
        //         category: cat,
        //         password: hashedPassword
        //     })
        // }
        // if (cat === teacher) {
        //     teachers.push({
        //         id: Date.now().toString(),
        //         name: req.body.name,
        //         email: req.body.email,
        //         category: cat,
        //         password: hashedPassword
        //     })
        // }
        // else {
        //     parents.push({
        //         id: Date.now().toString(),
        //         name: req.body.name,
        //         email: req.body.email,
        //         category: cat,
        //         password: hashedPassword
        //     })
        // }
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            group: req.body.group,
            password: hashedPassword
        })
        res.redirect('/login');
    } catch {
        res.redirect('/register')
    }
    console.log(users);
});

app.get('/student', function (req, res) {
    res.render('student.ejs', { name: req.user.name });
});

app.get('/teacher', function (req, res) {
    res.render('teacher.ejs', { name: req.user.name });
});

app.get('/parent', function (req, res) {
    res.render('parent.ejs', { name: req.user.name });
});

app.delete('/logout', function (req, res) {
    req.logout();
    console.log(users);
    res.redirect('/login');
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.listen(3000, function (req, res) {
    console.log('Server running on port 3000');
});