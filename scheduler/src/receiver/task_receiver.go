package main

import (
	"encoding/json"
    "errors"
	"fmt"
    "flag"
	"html/template"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

    "data"
	"taobao/client"

    "github.com/pelletier/go-toml"
	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"
)

type getShopResult struct {
	Nick  string `json:"nick"`
	Sid   int    `json:"sid"`
	Title string `json:"title"`
}

var MgoSession *mgo.Session
var dbName string
var shopLock chan int = make(chan int)
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

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		t, err := template.ParseFiles("templates/list.html")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		c := MgoSession.DB(dbName).C("taobao_shops_depot")
		results := make([]data.ShopItem, 0)
		err = c.Find(bson.M{}).All(&results)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		t.Execute(w, results)
		return
	}
}

func addHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		t, err := template.ParseFiles("templates/add_shop.html")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		t.Execute(w, nil)
	} else if r.Method == "POST" {
		r.ParseForm()
		fmt.Println(r.Form["shop_name"])
		c := MgoSession.DB(dbName).C("taobao_shops_depot")
		shopName := r.Form["shop_name"][0]
		shopInfo, topErr := client.GetTaobaoShopInfo(shopName)
		if topErr != nil {
            http.Redirect(w, r, "/home", http.StatusFound)
			return
		}
		result := data.ShopItem{}
        fmt.Println("lock")
		
        go func() {
            c.Find(bson.M{"shop_info.sid": shopInfo.Sid}).One(&result)
		    fmt.Println("add shop", result.ShopInfo.Nick)
            if result.ShopInfo.Nick != "" {
                shopLock <- 0 // Unlock
			    return
		    }
		    result.ShopInfo = *shopInfo
            result.CreatedTime = time.Now()
            result.LastUpdatedTime = time.Now()
		    result.Status = "queued"
		    err := c.Insert(&result)
		    if err != nil {
			    panic(err)
		    }
            shopLock <- 1 // Unlock
        } ()
        resultCode := <-shopLock  // Lock before insert shop item
		if resultCode == 0 {
            // Todo: show info in client
            http.Redirect(w, r, "/home", http.StatusFound)
        } else {
		    http.Redirect(w, r, "/home", http.StatusFound)
        }
	}
}

func getShopHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		c := MgoSession.DB(dbName).C("taobao_shops_depot")
		result := data.ShopItem{}
		c.Find(bson.M{"status": "queued"}).One(&result)
        if result.ShopInfo.Nick == "" {
            io.WriteString(w, "0")
        } else {
		    change := bson.M{"$set": bson.M{"status": "crawling", "last_crawled_time" : time.Now()}}
		    c.Update(bson.M{"shop_info.sid": result.ShopInfo.Sid, "status" : "queued"}, change)
            fmt.Println(result.ShopInfo.Nick)
		    shopResult := getShopResult{result.ShopInfo.Nick, result.ShopInfo.Sid, result.ShopInfo.Title}
            data, _ := json.Marshal(shopResult)
		    io.WriteString(w, string(data))
		}
	}
}

func sendShopItemIdsHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.FormValue("sid"))
	r.ParseForm()
	sid, _ := strconv.Atoi(r.Form["sid"][0])
	itemsString := r.Form["item_ids"][0]
	itemIDs := strings.Split(itemsString, ",")
	c := MgoSession.DB(dbName).C("raw_taobao_items_depot")
	for _, v := range itemIDs {
		taobaoItem := data.TaobaoItem{}
		numIid, err := strconv.Atoi(v)
        if err != nil {
            continue
        }

		c.Find(bson.M{"num_iid": numIid}).One(&taobaoItem)
		if taobaoItem.NumIid == 0 {
            fmt.Println(numIid, v)
			taobaoItem.Sid = sid
			taobaoItem.NumIid = numIid
            taobaoItem.CreatedTime = time.Now()
			err := c.Insert(&taobaoItem)
			if err != nil {
				panic(err)
			}
		}
	}
	io.WriteString(w, "0")
}

func main() {
	http.HandleFunc("/home", homeHandler)
	http.HandleFunc("/add", addHandler)
	http.HandleFunc("/get_shop", getShopHandler)
	http.HandleFunc("/send_items", sendShopItemIdsHandler)
	err := http.ListenAndServe(":10080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err.Error())
	}
}
