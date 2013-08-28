package test

import (
    "fmt"
    "testing"
    "data"

    "labix.org/v2/mgo"
    "labix.org/v2/mgo/bson"
)

func TestMongo(t *testing.T) {
    session, err := mgo.Dial("localhost")
    if err != nil {
        //t.Errorf("got error %s.", error.Error)
        fmt.Println("can't open")
    }
    c := session.DB("test").C("raw_taobao_items_depot")
    item := data.TaobaoItem{}
    c.Find(bson.M{"num_iid" : 20063296952}).One(&item)
    fmt.Println("find", item.NumIid)
    if item.NumIid == 0 {
        fmt.Println(item.NumIid)
    }
}
