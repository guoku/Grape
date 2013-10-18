var Express = require("express");
var Request = require("request");
var Hatchery = require("./hatchery");
var Storage = require("./storage");
var Config = require("./config");

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
        console.log(data[0].shop_id);
        console.log(data[0].items_list.length);

        var size = 500;
        var part_post = function(k){
            var part = data[0].items_list.slice(k*size, (k+1)*size);
            console.log(part.length);
            options.form = {
                sid      : data[0].shop_id,
                item_ids : part.join(","),
                finish   : (k+1)*size<data[0].items_list.length?0:1
            };
            var req = Request(options, function(error, res, body){
                console.log("post sent...");
                if(!error && !((k+1)*size<data[0].items_list.length)){
                    Storage.update('minerals', data[0]);
                    lock = false;
                }
                else if(error) {
                    console.log("post item request error: " + error);
                    lock = false;
                }
                req.end();

                if(options.form.finish == 0){
                    part_post(++k);
                }
            });
        };
        var k = 0;
        part_post(k);
    });

};
setInterval(post_item, 1000 * 10);
