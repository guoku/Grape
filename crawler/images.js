var Express = require("express");
var Hatchery = require("./hatchery");
var Storage = require("./storage");
var Config = require("./config");

function main(){
    var hatchery = new Hatchery(); 
    item_id = 18861594402;
    if(hatchery.tasks.item.indexOf(item_id) == -1){
        hatchery.tasks.item.push(item_id);
        console.log("all item tasks: " , hatchery.tasks.item);
    }
}
main();
