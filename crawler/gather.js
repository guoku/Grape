var Config = require("./Config")
var Http = require("http");
var Url = require("url");
var $ = require("jQuery");

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
        var req = Http.request(options, function(res){
            console.log(options['hostname'] + options['path'] + ' : ' + res.statusCode);
            if (res.statusCode == '302'){
                var redirect_url = res.headers.location;
                req.end();
                gather.get(parse_f, {url:redirect_url}, callback)
                return;
            }

//            timeout = setTimeout(function() {
//                timeout = null;
//                req.abort();
//                console.error(err);
//            }, 5000);

            res.setEncoding('utf8');
            var buffers = [];
            res.on('data', function (chunk) {
                var b = new Buffer(chunk);
                buffers.push(b);
            }).on('end', function(){
                var html = Buffer.concat(buffers).toString();
                parse_f(html, callback);
            }).on('error', function(err) {
//                clearTimeout(response_timeout);
                console.error(err);
            });
        });
        req.end();
    }
};

module.exports = Gather;