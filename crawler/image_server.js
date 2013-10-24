var Express = require("express");
var Hatchery = require("./hatchery");
var Storage = require("./storage");
var Config = require("./config");

function main(){
    var hatchery = new Hatchery(); 
    if(hatchery.tasks.item.length>100)
        return;

    Storage.readOne('minerals', {gather_image:{$ne : 1}}, function(data){
        if (!data[0])
            return;
        
        for(var i in data[0].items_list){
            item_id = parseInt(data[0].items_list[i]);
            if(item_id && hatchery.tasks.item.indexOf(item_id) == -1){
                hatchery.tasks.item.push(item_id);
            }
        }
        console.log("count of all item tasks: " , hatchery.tasks.item.length);
        Storage.update('minerals', data[0], {gather_image:1});
    });

}
setInterval(main, 1000 * 30);
