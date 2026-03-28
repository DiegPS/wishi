package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
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
	mu       sync.RWMutex
	filepath string
	wishes   []WishData
}

func InitDB(dataDir string) (*LocalDB, error) {
	dbPath := filepath.Join(dataDir, "wishes.json")
	db := &LocalDB{
		filepath: dbPath,
		wishes:   []WishData{},
	}

	if _, err := os.Stat(dbPath); err == nil {
		data, err := os.ReadFile(dbPath)
		if err != nil {
			return nil, fmt.Errorf("failed to read wishes file: %w", err)
		}
		if err := json.Unmarshal(data, &db.wishes); err != nil {
			// Instead of failing entirely, just start fresh if corrupted to ensure we don't crash
			fmt.Println("Warning: wishes format corrupted, starting fresh")
			db.wishes = []WishData{}
		}
	}

	return db, nil
}

func (db *LocalDB) Save() error {
	data, err := json.MarshalIndent(db.wishes, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(db.filepath, data, 0644)
}

func InsertWishes(db *LocalDB, newWishes []WishData) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	// Use map to ensure uniqueness like IGNORE INTO
	existing := make(map[string]bool)
	for _, w := range db.wishes {
		existing[w.Id] = true
	}

	for _, nw := range newWishes {
		if !existing[nw.Id] {
			// Append at the beginning or end? Typically append to the list
			db.wishes = append(db.wishes, nw)
			existing[nw.Id] = true
		}
	}

	return db.Save()
}

func GetLastEndId(db *LocalDB, gachaType string) (string, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	var lastId string = "0"
	// Find the maximum ID for this banner type
	// Note: Strings like IDs represent large numbers, string comparison on IDs works since they are monotonic lengths
	// but strictly we just need the "last inserted" which should have the largest numeric ID value
	for _, w := range db.wishes {
		if w.GachaType == gachaType {
			if len(w.Id) > len(lastId) || (len(w.Id) == len(lastId) && w.Id > lastId) {
				lastId = w.Id
			}
		}
	}
	return lastId, nil
}
