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

function random_string(size){
    var str = "";
    for (var i = 0; i < size; i++){
        str += random_character();
    }
    return str;
}
function random_character() {
    var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
    return chars.substr( Math.floor(Math.random() * 62), 1);
}
module.exports = {
    middleware:function(app,addressTypes) {
        app.use(function(req, res, next) {
            if(!req.session.key)
                req.session.key = random_string(64);
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
                        if(verified){
                            req.session.user = {
                                address: req.body.address,
                                coinName: req.body.coinName,
                                sig: req.body.sig
                            };
                            res.redirect("/login?code=0");
                        }else{
                            res.redirect("/login?code=1");
                        }
                    });
                else
                    res.redirect("/login?code=2");
            }else 
                res.redirect("/login?code=3");
        });
        app.use(function(req, res, next) {
            if(req.session.user)
                req.user = req.session.user;
            next();
        });
    }
};