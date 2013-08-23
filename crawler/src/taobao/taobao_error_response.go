package taobao

import (
	"strconv"
)

type ErrResponse struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
}

type TaobaoErrResponse struct {
	Error            string       `json:"error"`
	ErrorDescription string       `json:"error_description"`
	ErrResponse      *ErrResponse `json:"error_response"`
}

func (t *TaobaoErrResponse) GetErr() string {
	if t.Error != "" {
		return "[" + t.Error + "]" + t.ErrorDescription
	}
	if t.ErrResponse != nil {
		if t.ErrResponse.Code > 0 {
			return "[" + strconv.Itoa(t.ErrResponse.Code) + "]" + t.ErrResponse.Msg
		}
	}
	return ""
}
