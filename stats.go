package main

import "sort"

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

func GetBannerStats(db *LocalDB, gachaTypes []string, maxPity5 int) (BannerStats, error) {
	stats := BannerStats{MaxPity5: maxPity5, MaxPity4: 10}

	// Filter and sort by ID descending (newest first)
	db.mu.RLock()
	var relevant []WishData
	for _, w := range db.wishes {
		for _, gt := range gachaTypes {
			if w.GachaType == gt {
				relevant = append(relevant, w)
				break
			}
		}
	}
	db.mu.RUnlock()

	stats.TotalWishes = len(relevant)
	if stats.TotalWishes == 0 {
		return stats, nil
	}

	sort.Slice(relevant, func(i, j int) bool {
		// Newest first
		if len(relevant[i].Id) == len(relevant[j].Id) {
			return relevant[i].Id > relevant[j].Id
		}
		return len(relevant[i].Id) > len(relevant[j].Id)
	})

	found5 := false
	found4 := false

	for _, w := range relevant {
		if !found5 {
			if w.RankType == "5" {
				found5 = true
			} else {
				stats.Pity5++
			}
		}
		if !found4 {
			if w.RankType == "4" || w.RankType == "5" {
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

func GetAllStats(db *LocalDB) (DashboardData, error) {
	var data DashboardData

	data.Character, _ = GetBannerStats(db, []string{"301", "400"}, 90)
	data.Weapon, _ = GetBannerStats(db, []string{"302"}, 80)
	data.Standard, _ = GetBannerStats(db, []string{"200"}, 90)
	data.Chronicled, _ = GetBannerStats(db, []string{"500"}, 90)

	db.mu.RLock()
	data.Global.LifetimeWishes = len(db.wishes)
	var count5, count4 int
	for _, w := range db.wishes {
		if w.RankType == "5" {
			count5++
		} else if w.RankType == "4" {
			count4++
		}
	}
	db.mu.RUnlock()

	data.Global.Primogems = data.Global.LifetimeWishes * 160

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
