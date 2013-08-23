package main

import (
    "data"
	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"
	"taobao/client"
)

var MgoSession *mgo.Session

func init() {
    session, err := mgo.Dial("localhost")
    if err != nil {
        panic(err)
    }
    MgoSession = session
}

func getApiData(numIid int) {
   
}

func scanTaobaoItems() {
    c := MgoSession.DB("test").C("raw_taobao_items_depot")
    results := make([]data.TaobaoItem, 0)
    err := c.Find(bson.M{"api_data_ready" : false}).All(&results)
    if err != nil {
        panic(err)
    }
    for _, record := range results {
        getApiData(record.NumIid)
    }
}

func main() {
    scanTaobaoItems()
}
