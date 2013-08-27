var Gather = require("./Gather");
var Parser = require("./Parser");
var Hatchery = require("./Hatchery");

var Drone = function(options, callback){
    var _drone = {};

    _drone.options = options;
    _drone.get_parser = function(){
        if(this.options.type=="taobao_shop")
            return Parser.parse_taobao_shop;
        return null;
    };
    _drone.work = function(){
        var parser = this.get_parser();
        if(!parser){
//            var hatchery = new Hatchery();
//            hatchery.kill_drone(this);
            return false;
        }
        Gather.get(parser, this.options, callback);
    };

    return _drone;
};

module.exports = Drone;