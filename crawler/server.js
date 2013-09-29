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
    var options = {
        url      : Config.scheduler + "get_shop_from_queue?token=d61995660774083ccb8b533024f9b8bb",
        headers  : {
            "User-Agent" : "Firefox 22/Windows: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:22.0) Gecko/20100101 Firefox/22.0",
	    accept : "*/*",
        },
        method   : "GET",
        rejectUnauthorized : false
    };
    Request(options, function(error, res, body){
        console.log(error);
        console.log(res);
        console.log("get_shop:" + body)
	    var json = eval("(" + body + ")");
        if(!json || json.Sid == 0)
            return;

        var hatchery = new Hatchery(); 
        if(hatchery.tasks.shop.indexOf(json.sid) == -1){
            hatchery.tasks.shop.push(json.sid);
            console.log(hatchery.tasks.shop);
        }
    });

};
setInterval(get_task, 1000 * 10);

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
    Storage.read('minerals', {state:"gathered"}, function(data){
        if (data == [])
            return;

        for(var i in data){
            options.form = {
                sid      : data[i].shop_id,
                item_ids : data[i].items_list.join(","),
            };
            Request(options, function(error, res, body){
                console.log(error);
                if(!error){
                    Storage.update('minerals', data[i]);
                }
            });
        }
    });

};
setInterval(post_item, 1000 * 10);
