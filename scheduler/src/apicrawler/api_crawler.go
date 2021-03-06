package main

import (
    "errors"
    "flag"
    "fmt"
    "time"

    "data"

    "github.com/pelletier/go-toml"
	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"
	"taobao/client"
)

var MgoSession *mgo.Session
var dbName string

func init() {
    var env string
    flag.StringVar(&env, "env", "prod", "program environment")
    flag.Parse()
    var mongoSetting *toml.TomlTree
    conf, err := toml.LoadFile("config/config.toml")
    switch env {
        case "debug":
            mongoSetting = conf.Get("mongodb.debug").(*toml.TomlTree)
        case "staging":
            mongoSetting = conf.Get("mongodb.staging").(*toml.TomlTree)
        case "prod":
            mongoSetting = conf.Get("mongodb.prod").(*toml.TomlTree)
        default:
            panic(errors.New("Wrong Environment Flag Value. Should be 'debug', 'staging' or 'prod'"))
    }
    fmt.Println(mongoSetting.Get("host").(string), mongoSetting.Get("db").(string))
    session, err := mgo.Dial(mongoSetting.Get("host").(string))
    if err != nil {
        panic(err)
    }
    MgoSession = session
    dbName = mongoSetting.Get("db").(string)
}

func getApiData(c *mgo.Collection, numIid int) {
    itemInfo, topErr := client.GetTaobaoItemInfo(numIid)
    if topErr != nil {
        fmt.Println(topErr.Error())
        if topErr.SubCode == "isv.item-get-service-error:ITEM_NOT_FOUND" || topErr.SubCode == "isv.item-is-delete:invalid-numIid" {
           c.RemoveAll(bson.M{"num_iid" : numIid}) 
        }
        return
    }
    if itemInfo == nil {
        return
    }
    fmt.Println(numIid, itemInfo.Title)
    change := bson.M{"$set" : bson.M{"api_data" : *itemInfo, "api_data_ready" : true, "api_data_updated_time" : time.Now()}}
    c.Update(bson.M{"num_iid" : numIid, "api_data_ready" : false}, change)
}

func scanTaobaoItems() {
    c := MgoSession.DB(dbName).C("raw_taobao_items_depot")
    results := make([]data.TaobaoItem, 0)
    err := c.Find(bson.M{"api_data_ready" : false}).All(&results)
    if err != nil {
        panic(err)
    }
    for _, record := range results {
        fmt.Println(record.Sid, record.NumIid)
        getApiData(c, record.NumIid)
    }
}

func main() {
    for {
        scanTaobaoItems()
        time.Sleep(5 * time.Minute)
    }
}
