package rest

import (
	"fmt"
	"testing"

)

func TestItemGetRequest(t *testing.T) {
	r := ItemGetRequest{}
	r.SetAppInfo("12313170", "90797bd8d5859aac971f8cc9d4e51105")
	r.SetFields("detail_url,num_iid,title,nick,type,desc,cid,pic_url,num,list_time,delist_time,stuff_status,location,price,global_stock_type,item_imgs,item_img,skus,sku,props_name,prop_imgs,prop_img")
	r.SetNumIid(19503418914)
	resp, _, err := r.GetResponse()
	if err != nil {
		t.Errorf("got error %s.", err.Error())
	}
	fmt.Println(resp.Item.Title)
	fmt.Println(resp.Item.Price)
	fmt.Println(resp.Item.ItemImgs.ItemImgArray)
	r.SetNumIid(1950341)
	resp, _, err = r.GetResponse()
    if err != nil {
        fmt.Println(err.SubCode)
    }

    fmt.Println(err.Error())
}
