var Gather = require("./gather");
var Parser = require("./parser");
var Hatchery = require("./hatchery");

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
            return false;
        }
        Gather.get(parser, this.options, callback);
    };

    return _drone;
};

module.exports = Drone;
