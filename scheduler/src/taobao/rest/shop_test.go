package rest

import (
	"fmt"
	"testing"
)

func TestShopGetRequest(t *testing.T) {
	r := ShopGetRequest{}
	r.SetAppInfo("12313170", "90797bd8d5859aac971f8cc9d4e51105")
	r.SetFields("sid,cid,nick,title,pic_path,created,modified,shop_score")
	r.SetNick("aree926")
	resp,_, err := r.GetResponse()
	if err != nil {
		t.Errorf("got error %s.", err.Error)
	}
	fmt.Println(resp.Shop.Title)
	r.SetNick("德尔玛华柯专卖店")
	resp, _, err = r.GetResponse()
	if err != nil {
		t.Errorf("got error %s.", err.Error)
	}
	fmt.Println(resp.Shop.Title)
}
