var $ = require("jQuery");
var Hatchery = require("./Hatchery");
var Storage = require("./Storage");

var MineralField = function(options){
    var _mf = $.extend({
        type          : "taobao_shop",
        shop_id       : "",
        state         : "idle",
        page          : 1, 
        items_num     : 0,
        items_list    : [],
    },options);

    _mf.get_location = function(){
        if (this.state == "gathered" || this.state == "error")
            return false;

        var page_str = this.page > 1? "&pageNum="+this.page : "";
        return {
            hostname : "shop"+this.shop_id+".taobao.com",
            path     : "/?search=y" + page_str,
            type     : this.type
        };
    };
    _mf.update = function(data){
        this.items_num = parseInt(data.items_num);
        this.items_list = this.items_list.concat(data.id_list);
        if(data.id_list.length == 0){
            return false;
        }
        console.log(this.items_num + " || " + this.items_list.length);
        if(!this.items_num || this.items_num < 0){
            if(data.has_more){
                this.items_num = this.items_list.length + 1;
                this.state = 'occupied';
                this.page++;
            }
            else{
                if (this.items_list.length > 0) {
                    this.items_num = this.items_list.length;
                    this.state = 'gathered';
                    this.store();
                }
                else
                    this.state = 'error';
            }
        }
        else{
            if(this.items_list.length < this.items_num){
                this.page++;
                this.state = 'occupied';
            }
            else{
                this.state = 'gathered';
                this.store();
            }
        }
    };
    _mf.store = function(){
        var mf = this;
        var date = new Date();
        var data = [{
            shop_id    : parseInt(mf.shop_id),
            state      : 'gathered',
            items_num  : mf.items_num,
            items_list : mf.items_list,
            date       : date.toString()
        }];
        Storage.write('minerals', data);
    }

    return _mf;
};

module.exports = MineralField;
