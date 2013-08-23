package rest

import (
	"taobao"
)

type ShopGetRequest struct {
	taobao.TaobaoRequest
}

func (t *ShopGetRequest) SetFields(value string) {
	t.SetValue("fields", value)
}

func (t *ShopGetRequest) SetNick(value string) {
	t.SetValue("nick", value)
}

func (t *ShopGetRequest) GetResponse() (*ShopGetResponse, []byte, error) {
	var resp ShopGetResponseResult
	data, err := t.TaobaoRequest.GetResponse("taobao.shop.get", &resp, "")
	if err != nil {
		return nil, data, err
	}
	return resp.Response, data, err
}
