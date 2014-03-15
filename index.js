function verifyMsg(coinName,coinVersion,address,message,sig,callback){
    require("./lib/bitcoinjs.js")({
        coinName:coinName,
        coinAddressVersion:coinVersion,
    },function(ECKey,Message){
        try{
            var verify = Message.verifyMessage(address,sig,message);
            callback(verify);
        }catch(e){
            callback(false);
        }
    });
}
var crypto = require('crypto');

function getRandomInt (min, max) {
    var rndInt = Math.floor(Math.random() * (max - min + 1)) + min;
    return crypto.createHash('sha256').update(rndInt).digest('base64');
}

module.exports = {
    middleware:function(app,addressTypes) {
        app.use(function(req, res, next) {
            if(!req.session.key)
                req.session.key = getRandomInt (9999999999999999999,99999999999999999999)+""+(new Date().getTime());
            next();
        });
        app.post("/login",function(req, res, next) {
            if(
                req.body.coinName && 
                req.body.address && 
                req.body.sig
            ){  
                if(addressTypes[req.body.coinName])
                    verifyMsg(req.body.coinName,addressTypes[req.body.coinName],req.body.address,req.session.key,req.body.sig,function(verified){
                        if(verified)
                            req.session.user = {
                                address: req.body.address,
                                coinName: req.body.coinName,
                                sig: req.body.sig
                            };
                        res.redirect("/login");
                    });
                else
                    res.redirect("/login");
            }else 
                res.redirect("/login");
        });
        app.use(function(req, res, next) {
            if(req.session.user)
                req.user = req.session.user.address;
            next();
        });
    }
};