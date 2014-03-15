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

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    middleware:function(app,addressTypes) {
        app.use(function(req, res, next) {
            if(!req.session.key)
                req.session.key = 123;//getRandomInt (9999999999999999999,99999999999999999999);
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
                                key: req.body.key,
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