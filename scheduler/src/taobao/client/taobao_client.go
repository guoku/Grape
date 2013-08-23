package client

import (
    "fmt"
    "taobao"
    "taobao/rest"
)

var GUOKU_MOBI_APP_INFO taobao.AppInfo = taobao.AppInfo{"12313170", "90797bd8d5859aac971f8cc9d4e51105"}

func GetTaobaoShopInfo(nick string) *rest.Shop {
    r := rest.ShopGetRequest{}
    r.SetAppInfo(GUOKU_MOBI_APP_INFO.AppKey,
                 GUOKU_MOBI_APP_INFO.Secret)
    r.SetNick(nick)
    r.SetFields("sid,cid,nick,title,pic_path,created,modified,shop_score")
    resp, _, err := r.GetResponse()
    if err != nil {
        fmt.Println(err.Error())
        return nil
    }
    return resp.Shop
}
