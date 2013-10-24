var Mongo = require("mongoskin");
var Config = require("./config");

var Storage = {
    host    : "",
    port    : "",
    dbname  : "",
    db      : null,
    init    : function(){
        this.host = Config.mongo.host;
        this.port = Config.mongo.port;
        this.dbname = Config.mongo.dbname;
        this.db = new Mongo.db(this.host + ":" + this.port + "/" + this.dbname);
    },
    readOne : function(collection_name, query, callback){
        if(!this.db){
            this.init();
        }

        var collection = this.db.collection(collection_name);
        collection.find(query, {limit:1, sort:{'date': -1}}).toArray(function(err,docs){
            callback(docs);
        });
    },
    read    : function(collection_name, query, callback){
        if(!this.db){
            this.init();
        }

        var collection = this.db.collection(collection_name);
        collection.find(query).toArray(function(err,docs){
            callback(docs);
        });
    },
    write   : function(collection_name, data){
        if(!this.db){
            this.init();
        }

        var collection = this.db.collection(collection_name);
        collection.insert(data, {w:1}, function(err, result){
            if(err)
                console.log("mongo input error: " + err);
        });
    },
    update   : function(collection_name, obj, data){
        if(!this.db){
            this.init();
        }

        var collection = this.db.collection(collection_name);
        collection.update({_id:obj._id}, {$set: data});
    },
    save_image : function(content, name, item_id, callback){
        var that = this;
        var GridFS = require('GridFS').GridFS;
        var myFS = new GridFS('zerg');

        var md5 = require("MD5");
        var image_md5 = md5(content);
        that.read('fs.files', {md5:image_md5}, function(data){
            if(data.length != 0 ){
                save_item_image(data[0]);
            }
            else{
                myFS.put(content, name, 'w', function(err, res){
                    if(err) {
                        console.log(err);
                        return false;
                    }
                    save_item_image(res);
                });
                myFS.close();
            }
        });

        var save_item_image = function(obj){
            that.read('taobao_item_images', {item_id:item_id}, function(data){
                console.log("save_item_image:" + obj.md5);
                if(data.length == 0){
                    var collection = that.db.collection("taobao_item_images");
                    collection.insert({
                        item_id : item_id,
                        images  : [{id: obj._id, md5:obj.md5}]
                    }, {w:1}, function(e){
                        if(e)
                            console.log("mongo input error: " + e);

                        callback();
                    });
                }
                else{
                    var images_arr = data[0].images;
                    for(var k in images_arr){
                        if(images_arr[k].md5 == obj.md5){
                            callback();
                            return;
                        }
                    }
                    images_arr.push({
                        id: obj._id,
                        md5:obj.md5
                    });
                    var collection = that.db.collection("taobao_item_images");
                    collection.update({_id:data[0]._id}, {$set: {images:images_arr}}, function(e){
                        if(e)
                            console.log("mongo update error: " + e);

                        callback();
                    });
                }
            });
        }
    }
};

//Storage.readOne('minerals', {shop_id:58011951}, function(data){
//    Storage.update('minerals', data[0]);
//});
//Storage.read('taobao_items_images', {item_id:"1580297"}, function(v){console.log(v)});

module.exports = Storage;
