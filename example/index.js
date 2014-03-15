var express = require('express');
var app = express();
var ejs = require("ejs");
var fs = require("fs");

app.use(express.cookieParser());
app.use(express.session({
    secret: '1234567890QWERTY'
}));
app.use(express.bodyParser());


var addressTypes = {
    "Bitcoin":0x00,
    "Dogecoin":0x1e,
    "Litecoin":0x30
};
 
require("wallet-login").middleware(app,addressTypes);

app.get('/login', function(req, res) {
    if(req.session.user)
        return res.redirect("/");
    res.send(ejs.render(fs.readFileSync(__dirname + "/login.html").toString(), 
        {
            req:req,
            addressTypes:addressTypes
        }
    ));
});

app.use('/logout', function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.get('/', function(req, res) {
    res.send('Home - ' + (!req.session.user ? "<a href='/login'>Login</a>" : "<a href='/logout'>Logout</a> - Address: "+req.session.user.address));
});

app.listen(process.env.PORT || 8080);