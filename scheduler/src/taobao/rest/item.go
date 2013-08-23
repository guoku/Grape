package rest

import (
	"strconv"
	"taobao"
)

type ItemGetRequest struct {
	taobao.TaobaoRequest
}

func (t *ItemGetRequest) SetFields(value string) {
	t.SetValue("fields", value)
}

func (t *ItemGetRequest) SetNumIid(value int) {
	t.SetValue("num_iid", strconv.Itoa(value))
}

func (t *ItemGetRequest) GetResponse() (*ItemGetResponse, []byte, error) {
	var resp ItemGetResponseResult
	data, err := t.TaobaoRequest.GetResponse("taobao.item.get", &resp, "")
	if err != nil {
		return nil, data, err
	}
	return resp.Response, data, err
}
