package client

import (
    "fmt"
    "taobao"
    "taobao/rest"
)

var GUOKU_MOBI_APP_INFO taobao.AppInfo = taobao.AppInfo{"12313170", "90797bd8d5859aac971f8cc9d4e51105"}

func GetTaobaoShopInfo(nick string) (*rest.Shop, *taobao.TopError) {
    r := rest.ShopGetRequest{}
    r.SetAppInfo(GUOKU_MOBI_APP_INFO.AppKey,
                 GUOKU_MOBI_APP_INFO.Secret)
    r.SetNick(nick)
    r.SetFields("sid,cid,nick,title,pic_path,created,modified,shop_score")
    resp, progErr, topErr := r.GetResponse()
    if progErr != nil {
        fmt.Println(progErr.Error())
        return nil, topErr
    }
    if topErr != nil || resp == nil {
        return nil, topErr
    }
    return resp.Shop, topErr
}

func GetTaobaoItemInfo(numIid int) (*rest.Item, *taobao.TopError) {
    r := rest.ItemGetRequest{}
    r.SetAppInfo(GUOKU_MOBI_APP_INFO.AppKey,
                 GUOKU_MOBI_APP_INFO.Secret)
    r.SetNumIid(numIid)
	r.SetFields("detail_url,num_iid,title,nick,type,desc,cid,pic_url,num,list_time,delist_time,stuff_status,location,price,global_stock_type,item_imgs,item_img,skus,sku,props_name,prop_imgs,prop_img")
    resp, progErr, topErr := r.GetResponse()
    if progErr != nil {
        fmt.Println(progErr.Error())
        return nil, topErr
    }
    if topErr != nil || resp == nil {
        return nil, topErr
    }
    return resp.Item, topErr
}
