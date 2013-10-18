var Config = require("./config")
var Http = require("http");

var index = Math.floor(Math.random()*1000 % Config.ua.length);
var ua = Config.ua[index];
var options={
    hostname:"www.baidu.com",
    path : "",
    port : "80",
    headers: {
        "User-Agent" : ua
    },
    method : "GET"
};
console.log(options);
var req = Http.request(options, function(res){
    var buffers = [];
    res.on('data', function (chunk) {
        var b = new Buffer(chunk);
        buffers.push(b);
    }).on('end', function(){
        var html = Buffer.concat(buffers).toString();
        console.log(html);
    })
});
