var Drone = require("./drone");
var MineralField = require("./mineralField");
var Storage = require("./storage");

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
                }, 1000  * 30);

                setInterval(function(){
                    if(hatchery.tasks.item.length > 0){
                        var item_id = hatchery.tasks.item.shift();
                        var drone = hatchery.create_drone({
                            hostname : "item.taobao.com",
                            path     : "/item.htm?id=" + item_id,
                            type     : "taobao_item_image"
                        }, function(data){
                            data.item_id = item_id;
                            hatchery.kill_drone(drone);

                            var save = function(){
                                var image_url = data.image_url_list.shift();
                                if(!image_url) return;

                                var image_drone = hatchery.create_drone({
                                    url      : image_url,
                                    type     : "image"
                                },function(content, filename){
                                    Storage.save_image(content, filename, item_id, function(){
                                        save();
                                    });
                                });
                                image_drone.work();
                            }
                            save();
                        });
                        drone.work();
                    }
                }, 1000  * 10);
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
