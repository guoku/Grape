var Express = require("express");
var Request = require("request");
var Hatchery = require("./hatchery");
var Storage = require("./storage");
var Config = require("./config");

var get_task = function(){
    var get_options = {
        url      : Config.scheduler + "get_shop_from_queue?token=d61995660774083ccb8b533024f9b8bb",
        headers  : {
            "User-Agent" : "Firefox 22/Windows: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:22.0) Gecko/20100101 Firefox/22.0",
	    accept : "*/*",
        },
        method   : "GET",
        rejectUnauthorized : false
    };
    try{
        var req = Request(get_options, function(error, res, body){
            if (error){
                console.log("get task request error: " + error);
                return;
            }
            console.log("get_shop:" + body)
            var json = eval("(" + body + ")");
            if(!json || json.Sid == 0)
                return;

            var hatchery = new Hatchery(); 
            if(hatchery.tasks.shop.indexOf(json.sid) == -1){
                hatchery.tasks.shop.push(json.sid);
                console.log("all shop tasks: " , hatchery.tasks.shop);
            }

            req.end();
        });
    }
    catch(e){
        console.log(e);
    }

};
setInterval(get_task, 1000  * 100 );
