var $ = require("jQuery");

var Parser = {
    parse_taobao_shop : function(html, callback){
        var id_list = [];
        $(html).find('.shop-hesper-bd a[href*="item.taobao.com"] img , .shop-hesper-bd a[href*="detail.tmall.com"] img').each(function(){
            var href = $(this).parent().attr("href");
            var start = href.indexOf("id=") + 3;
            var end = href.indexOf("&", start);
            if(end == -1)
                var id = href.slice(start);
            else
                var id = href.slice(start, end);
            id_list.push(id);
        });

        var items_num = $.trim($(html).find(".search-result span").text());

        callback({
            items_num : items_num,
            id_list : id_list
        });
    }
};
module.exports = Parser;
