var Drone = require("./Drone");
var MineralField = require("./MineralField");

var Hatchery = function(){
    return _hatchery.get();
};

var _hatchery = {
    obj : null,
    init : function(){
        this.obj = {
            state   : "free",
            support : 0,
            tasks   : {
                shop : [],
                item : [],
                url  : []
            },
            create_drone : function(options, callback){
                var drone = new Drone(options, callback);
                this.support++;
                return drone;
            },
            kill_drone : function(drone){
                this.support--;
                drone = null;
            },
            dominate_mf: function(options){
                var mf = new MineralField(options);
                var hatchery = this;

                var gather_one_page = function(mf){
                    var mf_location = mf.get_location()
                    if (!mf_location)
                        return false;

                    var drone = hatchery.create_drone(mf_location, function(data){
                        mf.update(data);
                        hatchery.kill_drone(drone);
                        gather_one_page(mf);
                    });
                    drone.work();
                }
                gather_one_page(mf);

                return mf;
            },
            hatch : function(){
                this.state = "hatching";
                var hatchery = this;
                setInterval(function(){
                    if(hatchery.tasks.shop.length > 0){
                        var shop_id = hatchery.tasks.shop.shift();
                        hatchery.dominate_mf({
                            shop_id : shop_id
                        });
                    }
                }, 1000 /* * 60*/);
            }
        };
    },
    get : function(){
        if (!this.obj) 
            this.init();
        if (this.obj.state == "free")
            this.obj.hatch();

        return this.obj;
    }
};

module.exports = Hatchery;
