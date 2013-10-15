var $ = require("jQuery");

var Parser = {
    parse_taobao_shop : function(html, callback){
        var id_list = [];
        $(html).find('.shop-hesper-bd a[href*="item.taobao.com"] img , .shop-hesper-bd a[href*="detail.tmall.com"] img, .skin-box-bd a[href*="detail.tmall.com"] img').each(function(){
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
        if (!parseInt(items_num) && $(html).find("a:contains('下一页').disable").get(0)==undefined ) {
            var has_more = true;
        }
        else 
            var has_more = false;
        console.log("shop has more items: " + has_more);

        callback({
            items_num : items_num,
            id_list   : id_list,
            has_more  : has_more
        });
    },
    parse_taobao_item_image : function(html, callback){
        var image_url_list = [];
        $(html).find('.tb-pic a img').each(function(){
            var url = this.src.replace(/\_[0-9]+x[0-9]+\.(jpg|png|gif)/, "");
            image_url_list.push(url);
        });

        callback({
            image_url_list : image_url_list
        });
    }
};
module.exports = Parser;
