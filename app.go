package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
	db  *sql.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize DB (Portable Mode: Save next to the .exe)
	exePath, err := os.Executable()
	var dbDir string
	if err == nil {
		dbDir = filepath.Dir(exePath)
	} else {
		dbDir = "."
	}

	db, err := InitDB(dbDir)
	if err == nil {
		a.db = db
	}
}

type SyncResult struct {
	Success bool          `json:"success"`
	Url     string        `json:"url"`
	Error   string        `json:"error"`
	Stats   DashboardData `json:"stats"`
}

type WishRecord struct {
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

// GetInitialStats is called on frontend load
func (a *App) GetInitialStats() DashboardData {
	if a.db == nil {
		return DashboardData{}
	}
	stats, _ := GetAllStats(a.db)
	return stats
}

// GetWishHistory returns a list of wishes from the DB
func (a *App) GetWishHistory(limit int, offset int) []WishRecord {
	if a.db == nil {
		return []WishRecord{}
	}

	// Use -1 limit to fetch all if requested implicitly or directly use the given limit
	query := "SELECT id, uid, gacha_type, item_id, count, time, name, lang, item_type, rank_type FROM wishes ORDER BY time DESC"
	var rows *sql.Rows
	var err error

	if limit > 0 {
		query += " LIMIT ? OFFSET ?"
		rows, err = a.db.Query(query, limit, offset)
	} else {
		rows, err = a.db.Query(query)
	}

	if err != nil {
		return []WishRecord{}
	}
	defer rows.Close()

	var results []WishRecord
	for rows.Next() {
		var r WishRecord
		err := rows.Scan(&r.Id, &r.Uid, &r.GachaType, &r.ItemId, &r.Count, &r.Time, &r.Name, &r.Lang, &r.ItemType, &r.RankType)
		if err == nil {
			results = append(results, r)
		}
	}
	return results
}

// SyncHistory extracts the wish URL from the Genshin cache and downloads the data
func (a *App) SyncHistory() SyncResult {
	runtime.EventsEmit(a.ctx, "syncProgress", "🔍 Buscando archivos de Genshin Impact...")
	userProfile := os.Getenv("USERPROFILE")
	if userProfile == "" {
		return SyncResult{Error: "USERPROFILE env variable not found"}
	}

	isChina := false
	logPath := filepath.Join(userProfile, "AppData", "LocalLow", "miHoYo", "Genshin Impact", "output_log.txt")

	if _, err := os.Stat(logPath); os.IsNotExist(err) {
		logPathCn := filepath.Join(userProfile, "AppData", "LocalLow", "miHoYo", "原神", "output_log.txt")
		if _, err := os.Stat(logPathCn); os.IsNotExist(err) {
			return SyncResult{Error: "Cannot find Genshin Impact log file. Please open wish history in game first."}
		}
		logPath = logPathCn
		isChina = true
	}

	logBytes, err := os.ReadFile(logPath)
	if err != nil {
		return SyncResult{Error: "Failed to read log file"}
	}

	reMatchDir := regexp.MustCompile(`([a-zA-Z]:/.+(?:GenshinImpact_Data|YuanShen_Data))`)
	matches := reMatchDir.FindStringSubmatch(string(logBytes))
	if len(matches) < 2 {
		return SyncResult{Error: "Cannot find the Game Data directory in log."}
	}

	gamedir := matches[1]
	gamedir = strings.ReplaceAll(gamedir, "/", string(os.PathSeparator))

	webCachesPath := filepath.Join(gamedir, "webCaches")
	entries, err := os.ReadDir(webCachesPath)
	if err != nil {
		return SyncResult{Error: "Failed to read webCaches directory"}
	}

	var latestCacheDir string
	var latestTime time.Time

	for _, e := range entries {
		if e.IsDir() {
			info, err := e.Info()
			if err == nil && info.ModTime().After(latestTime) {
				latestTime = info.ModTime()
				latestCacheDir = filepath.Join(webCachesPath, e.Name())
			}
		}
	}
	if latestCacheDir == "" {
		return SyncResult{Error: "No cache versions found"}
	}

	runtime.EventsEmit(a.ctx, "syncProgress", "📂 Extrayendo caché web temporal...")
	dataFile := filepath.Join(latestCacheDir, "Cache", "Cache_Data", "data_2")
	if _, err := os.Stat(dataFile); os.IsNotExist(err) {
		return SyncResult{Error: "data_2 not found in cache"}
	}

	tmpFile := filepath.Join(os.TempDir(), "genshin_data_2_tmp")
	if err := copyFile(dataFile, tmpFile); err != nil {
		return SyncResult{Error: "Failed to copy cache file: " + err.Error()}
	}
	defer os.Remove(tmpFile)

	cacheBytes, err := os.ReadFile(tmpFile)
	if err != nil {
		return SyncResult{Error: "Failed to read copied cache file"}
	}

	parts := strings.Split(string(cacheBytes), "1/0/")
	var gachaLink string

	reLink := regexp.MustCompile(`(https.+?game_biz=.*)`)

	runtime.EventsEmit(a.ctx, "syncProgress", "🔑 Validando Token y Autorización con Hoyoverse...")

	for i := len(parts) - 1; i >= 0; i-- {
		p := parts[i]
		if strings.Contains(p, "webview_gacha") {
			subMatch := reLink.FindStringSubmatch(p)
			if len(subMatch) > 1 {
				rawLink := subMatch[1]
				idx := strings.IndexByte(rawLink, 0)
				if idx != -1 {
					rawLink = rawLink[:idx]
				}

				if testUrl(rawLink, isChina) {
					gachaLink = rawLink
					break
				}
			}
		}
	}

	if gachaLink == "" || a.db == nil {
		runtime.EventsEmit(a.ctx, "syncProgress", "❌ Falló: Sin Autenticación")
		return SyncResult{Error: "Could not find a valid wish URL. Did you open the history in game?"}
	}

	// Fetch all wishes per gacha type
	gachaTypes := []string{"301", "302", "200", "400", "500"} // Added 400 for safety, though 301 brings it usually.

	bannerNames := map[string]string{
		"301": "Personajes (Limitado)",
		"302": "Armas",
		"200": "Permanente",
		"400": "Personajes (Secundario)",
		"500": "Recopilatorio",
	}

	for _, gt := range gachaTypes {
		endId := "0"
		page := 1
		for {
			runtime.EventsEmit(a.ctx, "syncProgress", fmt.Sprintf("⬇️ Descargando Banner: %s (Pag: %d)...", bannerNames[gt], page))
			res, err := fetchWishesFromAPI(gachaLink, isChina, gt, endId)
			if err != nil || len(res.Data.List) == 0 {
				break
			}

			// Try inserting
			err = InsertWishes(a.db, res.Data.List)

			if len(res.Data.List) < 20 {
				break // Pagination ended
			}
			endId = res.Data.List[len(res.Data.List)-1].Id
			page++
			// Optional: sleep to avoid rate limiting
			time.Sleep(200 * time.Millisecond)
		}
	}

	runtime.EventsEmit(a.ctx, "syncProgress", "✅ Actualizando Estadísticas...")
	stats, _ := GetAllStats(a.db)
	return SyncResult{Success: true, Url: gachaLink, Stats: stats}
}

func copyFile(src, dst string) error {
	// Use PowerShell's Copy-Item to bypass Go's strict file locking on Windows
	cmd := exec.Command("powershell", "-NoProfile", "-Command", "Copy-Item", "-LiteralPath", "'"+src+"'", "-Destination", "'"+dst+"'", "-Force")

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("powershell copy failed: %s", string(output))
	}
	return nil
}

func testUrl(rawUrl string, isChina bool) bool {
	u, err := url.Parse(rawUrl)
	if err != nil {
		return false
	}

	u.Path = "gacha_info/api/getGachaLog"
	u.Fragment = ""
	if isChina {
		u.Host = "public-operation-hk4e.mihoyo.com"
	} else {
		u.Host = "public-operation-hk4e-sg.hoyoverse.com"
	}

	q := u.Query()
	q.Set("lang", "en-us")
	q.Set("gacha_type", "301")
	q.Set("size", "5")
	u.RawQuery = q.Encode()

	apiUrl := u.String()

	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest("GET", apiUrl, nil)
	if err != nil {
		return false
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		if resp != nil {
			resp.Body.Close()
		}
		return false
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return false
	}

	var result struct {
		Retcode int `json:"retcode"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		return false
	}

	return result.Retcode == 0
}
