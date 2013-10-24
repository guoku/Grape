var Config = require("./config")
var Http = require("http");
var Url = require("url");
var $ = require("jQuery");
var Iconv = require("iconv").Iconv;

var Gather = {
    get : function(parse_f, options, callback){
        if (options.url){
            var url_info = Url.parse(options.url);
            options.hostname = url_info.hostname;
            options.path = url_info.path?url_info.path:"";
            options.port = url_info.port?url_info.port:"";
        }
        
        var index = Math.floor(Math.random()*1000 % Config.ua.length);
        var ua = Config.ua[index];

        var options = $.extend({
            headers: {
                "User-Agent" : ua
            },
            method : "GET"
        }, options);

        var gather = this;
        console.log("gathering taobao shop...");
        var req = Http.request(options, function(res){
            console.log(options['hostname'] + options['path'] + ' : ' + res.statusCode);
            if (res.statusCode == '302' || res.statusCode == '301'){
                var redirect_url = res.headers.location;
                var new_options = Url.parse(redirect_url);
                if (!new_options['hostname']){
                    new_options['hostname'] = options['hostname'];
                }
                req.end();
                gather.get(parse_f, new_options, callback)
                return;
            }

            if (res.statusCode != '200'){
                req.end();
                return;
            }
            if (options['hostname'] && options['hostname'].indexOf("taobao") == -1 && options['hostname'].indexOf("tmall") == -1){
                res.setEncoding('utf8');
            }
            var buffers = [];
            res.on('data', function (chunk) {
                var b = new Buffer(chunk);
                buffers.push(b);
            }).on('end', function(){
                if (options['hostname'].indexOf("taobao") != -1 || options['hostname'].indexOf("tmall") != -1){
                    try{
                        var iconv = new Iconv('GBK', 'UTF-8');
                        var html = iconv.convert(Buffer.concat(buffers)).toString();
                    }
                    catch(e){
                        console.log(e);
                        return;
                    }
                    
                }
                else
                    var html = Buffer.concat(buffers).toString();

                parse_f(html, callback);
            })
        });
        req.on('error', function(err) {
            console.error(err);
        });
        req.end();
    },
    get_image : function(options, callback){
        if (options.url){
            var url_info = Url.parse(options.url);
            options.hostname = url_info.hostname;
            options.path = url_info.path?url_info.path:"";
            options.port = url_info.port?url_info.port:"";
        }
        
        var index = Math.floor(Math.random()*1000 % Config.ua.length);
        var ua = Config.ua[index];

        var options = $.extend({
            headers: {
                "User-Agent" : ua
            },
            method : "GET"
        }, options);

        var gather = this;
        console.log(options.url);
        var req = Http.request(options, function(res){
            if (res.statusCode != '200'){
                req.end();
                return;
            }
            var buffers = [];
            res.on('data', function (chunk) {
                var b = new Buffer(chunk);
                buffers.push(b);
            }).on('end', function(){
                var content = Buffer.concat(buffers);
                var str_arr = options.path.split("/");
                var filename = str_arr[str_arr.length-1];
                callback(content, filename);
            })
        });
        req.on('error', function(err) {
            console.error(err);
        });
        req.end();
    }
};

module.exports = Gather;
