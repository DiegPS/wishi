package main

import (
	"database/sql"
)

type BannerStats struct {
	TotalWishes int `json:"totalWishes"`
	Pity5       int `json:"pity5"`
	MaxPity5    int `json:"maxPity5"`
	Pity4       int `json:"pity4"`
	MaxPity4    int `json:"maxPity4"`
}

type GlobalStats struct {
	LifetimeWishes int     `json:"lifetimeWishes"`
	Primogems      int     `json:"primogems"`
	Luck5Star      float64 `json:"luck5Star"`
	Luck4Star      float64 `json:"luck4Star"`
}

type DashboardData struct {
	Character  BannerStats `json:"character"`
	Weapon     BannerStats `json:"weapon"`
	Standard   BannerStats `json:"standard"`
	Chronicled BannerStats `json:"chronicled"`
	Global     GlobalStats `json:"global"`
}

func GetBannerStats(db *sql.DB, gachaTypes []string, maxPity5 int) (BannerStats, error) {
	stats := BannerStats{MaxPity5: maxPity5, MaxPity4: 10}
	
	inClause := ""
	args := []interface{}{}
	for i, gt := range gachaTypes {
		if i > 0 {
			inClause += ","
		}
		inClause += "?"
		args = append(args, gt)
	}

	queryCount := "SELECT COUNT(*) FROM wishes WHERE gacha_type IN (" + inClause + ")"
	err := db.QueryRow(queryCount, args...).Scan(&stats.TotalWishes)
	if err != nil {
		return stats, err
	}
	if stats.TotalWishes == 0 {
		return stats, nil
	}

	queryRows := "SELECT rank_type FROM wishes WHERE gacha_type IN (" + inClause + ") ORDER BY id DESC"
	rows, err := db.Query(queryRows, args...)
	if err != nil {
		return stats, err
	}
	defer rows.Close()

	found5 := false
	found4 := false

	for rows.Next() {
		var rank string
		if err := rows.Scan(&rank); err != nil {
			continue
		}
		if !found5 {
			if rank == "5" {
				found5 = true
			} else {
				stats.Pity5++
			}
		}
		if !found4 {
			if rank == "4" || rank == "5" { // a 5-star resets 4-star pity technically
				found4 = true
			} else {
				stats.Pity4++
			}
		}
		if found5 && found4 {
			break
		}
	}

	return stats, nil
}

func GetAllStats(db *sql.DB) (DashboardData, error) {
	var data DashboardData

	// Character (301 & 400 share pity)
	data.Character, _ = GetBannerStats(db, []string{"301", "400"}, 90)
	data.Weapon, _ = GetBannerStats(db, []string{"302"}, 80)
	data.Standard, _ = GetBannerStats(db, []string{"200"}, 90)
	data.Chronicled, _ = GetBannerStats(db, []string{"500"}, 90)

	// Global Stats
	db.QueryRow("SELECT COUNT(*) FROM wishes").Scan(&data.Global.LifetimeWishes)
	data.Global.Primogems = data.Global.LifetimeWishes * 160

	// Calculate Avg Luck
	var count5, count4 int
	db.QueryRow("SELECT COUNT(*) FROM wishes WHERE rank_type = '5'").Scan(&count5)
	db.QueryRow("SELECT COUNT(*) FROM wishes WHERE rank_type = '4'").Scan(&count4)

	// Simple average: Total wishes / Total 5-stars (this isn't completely accurate without segmenting, but it's a good estimate)
	if count5 > 0 {
		data.Global.Luck5Star = float64(data.Global.LifetimeWishes) / float64(count5)
	} else {
		data.Global.Luck5Star = 0
	}

	if count4 > 0 {
		data.Global.Luck4Star = float64(data.Global.LifetimeWishes) / float64(count4)
	} else {
		data.Global.Luck4Star = 0
	}

	return data, nil
}
