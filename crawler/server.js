var Express = require("express");
var Request = require("request");
var Hatchery = require("./Hatchery");
var Storage = require("./Storage");
var Config = require("./Config");

var app = Express();
app.listen(8080);

app.get("/new/shop", function(req, res){
    var id = req.param("id");
    if (id)  { 
        var hatchery = new Hatchery(); 
        hatchery.tasks.shop.push(id);
        console.log(hatchery.tasks.shop);
        res.send("recived");
    }
    else {
        res.send("wrong id");
    }
});

app.get("/query/shop", function(req, res){
    var id = parseInt(req.param("id"));
    Storage.readOne('minerals', {shop_id:id}, function(data){
        res.send(data);
    });
});

var get_task = function(){
    var options = {
        url      : Config.scheduler + "get_shop",
        headers  : {
            "User-Agent" : "Firefox 22/Windows: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:22.0) Gecko/20100101 Firefox/22.0"
        },
        method   : "GET"
    };
    Request(options, function(error, res, body){
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
//setInterval(get_task, 1000 * 10);


var post_item = function(){
    var options = {
        url : Config.scheduler + "send_items",
        headers  : {
            "User-Agent" : "Firefox 22/Windows: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:22.0) Gecko/20100101 Firefox/22.0"
        },
        method   : "POST",
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
                if(!error){
                    Storage.update('minerals', data[i]);
                }
            });
        }
    });

};
//setInterval(post_item, 1000 * 120);
