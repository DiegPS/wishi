package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type GachaResponse struct {
	Retcode int    `json:"retcode"`
	Message string `json:"message"`
	Data    struct {
		Page string     `json:"page"`
		Size string     `json:"size"`
		List []WishData `json:"list"`
	} `json:"data"`
}

func fetchWishesFromAPI(baseUrl string, isChina bool, gachaType string, endId string) (*GachaResponse, error) {
	u, err := url.Parse(baseUrl)
	if err != nil {
		return nil, err
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
	q.Set("gacha_type", gachaType)
	q.Set("size", "20")
	if endId != "0" {
		q.Set("end_id", endId)
	}

	u.RawQuery = q.Encode()

	apiUrl := u.String()

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", apiUrl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var res GachaResponse
	if err := json.Unmarshal(bodyBytes, &res); err != nil {
		return nil, err
	}

	return &res, nil
}
