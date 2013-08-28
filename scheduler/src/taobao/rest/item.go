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

func (t *ItemGetRequest) GetResponse() (*ItemGetResponse, error, *taobao.TopError) {
	var resp ItemGetResponseResult
	_, progErr, topErr := t.TaobaoRequest.GetResponse("taobao.item.get", &resp, "")
	if progErr != nil {
		return nil, progErr, topErr
	}
	return resp.Response, progErr, topErr
}
