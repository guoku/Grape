var Express = require("express");
var Request = require("request");
var Hatchery = require("./hatchery");
var Storage = require("./storage");
var Config = require("./config");

//var app = Express();
//app.listen(9081);
//
//app.get("/new/shop", function(req, res){
//    var id = req.param("id");
//    if (id)  { 
//        var hatchery = new Hatchery(); 
//        hatchery.tasks.shop.push(id);
//        console.log(hatchery.tasks.shop);
//        res.send("recived");
//    }
//    else {
//        res.send("wrong id");
//    }
//});
//
//app.get("/query/shop", function(req, res){
//    var id = parseInt(req.param("id"));
//    Storage.readOne('minerals', {shop_id:id}, function(data){
//        res.send(data);
//    });
//});

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

var lock=false;
var post_item = function(){
    var options = {
        url : Config.scheduler + "send_taobao_items?token=d61995660774083ccb8b533024f9b8bb",
        headers  : {
            "User-Agent" : "Firefox 22/Windows: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:22.0) Gecko/20100101 Firefox/22.0",
	    accept : "*/*",
        },
        method   : "POST",
        rejectUnauthorized : false
    };
    Storage.readOne('minerals', {state:"gathered"}, function(data){
        if (!data[0] || lock)
            return;
        
        lock = true;
        options.form = {
            sid      : data[0].shop_id,
            item_ids : data[0].items_list.join(","),
        };
        console.log(data[0].shop_id);
        try{
            var req = Request(options, function(error, res, body){
                console.log("post sent...");
                if(!error){
                    Storage.update('minerals', data[0]);
                }
                else {
                    console.log("post item request error: " + error);
                }
                req.end();
                lock = false;
            });
        }
        catch(e){
            console.log(e);
            lock = false;
        }
    });

};
setInterval(post_item, 1000 * 10);
