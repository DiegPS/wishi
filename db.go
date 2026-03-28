package main

import (
	"database/sql"
	"fmt"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// InitDB initializes the SQLite database for wishes
func InitDB(dataDir string) (*sql.DB, error) {
	dbPath := filepath.Join(dataDir, "wishes.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	createTableQuery := `
	CREATE TABLE IF NOT EXISTS wishes (
		id TEXT PRIMARY KEY,
		uid TEXT,
		gacha_type TEXT,
		item_id TEXT,
		count TEXT,
		time TEXT,
		name TEXT,
		lang TEXT,
		item_type TEXT,
		rank_type TEXT
	);
	`
	_, err = db.Exec(createTableQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	return db, nil
}

type WishData struct {
	Id         string `json:"id"`
	Uid        string `json:"uid"`
	GachaType  string `json:"gacha_type"`
	ItemId     string `json:"item_id"`
	Count      string `json:"count"`
	Time       string `json:"time"`
	Name       string `json:"name"`
	Lang       string `json:"lang"`
	ItemType   string `json:"item_type"`
	RankType   string `json:"rank_type"`
}

func InsertWishes(db *sql.DB, wishes []WishData) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	stmt, err := tx.Prepare(`INSERT OR IGNORE INTO wishes (id, uid, gacha_type, item_id, count, time, name, lang, item_type, rank_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, w := range wishes {
		_, err = stmt.Exec(w.Id, w.Uid, w.GachaType, w.ItemId, w.Count, w.Time, w.Name, w.Lang, w.ItemType, w.RankType)
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit()
}

func GetLastEndId(db *sql.DB, gachaType string) (string, error) {
	var id string
	err := db.QueryRow("SELECT id FROM wishes WHERE gacha_type = ? ORDER BY id DESC LIMIT 1", gachaType).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return "0", nil
		}
		return "0", err
	}
	return id, nil
}
