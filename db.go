package main

import (
	"sync"
)

type WishData struct {
	Id        string `json:"id"`
	Uid       string `json:"uid"`
	GachaType string `json:"gacha_type"`
	ItemId    string `json:"item_id"`
	Count     string `json:"count"`
	Time      string `json:"time"`
	Name      string `json:"name"`
	Lang      string `json:"lang"`
	ItemType  string `json:"item_type"`
	RankType  string `json:"rank_type"`
}

type LocalDB struct {
	mu     sync.RWMutex
	wishes []WishData
}

func InitDB() *LocalDB {
	return &LocalDB{
		wishes: []WishData{},
	}
}

func InsertWishes(db *LocalDB, newWishes []WishData) {
	db.mu.Lock()
	defer db.mu.Unlock()

	// Use map to ensure uniqueness like IGNORE INTO
	existing := make(map[string]bool)
	for _, w := range db.wishes {
		existing[w.Id] = true
	}

	for _, nw := range newWishes {
		if !existing[nw.Id] {
			db.wishes = append(db.wishes, nw)
			existing[nw.Id] = true
		}
	}
}

func GetLastEndId(db *LocalDB, gachaType string) string {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var lastId string = "0"
	for _, w := range db.wishes {
		if w.GachaType == gachaType {
			if len(w.Id) > len(lastId) || (len(w.Id) == len(lastId) && w.Id > lastId) {
				lastId = w.Id
			}
		}
	}
	return lastId
}
