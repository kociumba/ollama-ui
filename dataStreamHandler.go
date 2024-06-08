package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"

	"github.com/charmbracelet/log"
)

var progressMutex = &sync.Mutex{}
var pullProgress int64
var wholeModelSize int64

func updateProgress(current int64, total int64) {
	progressMutex.Lock()
	defer progressMutex.Unlock()
	pullProgress = current
	wholeModelSize = total
}

// returnProgress[0] = pullProgress
// returnProgress[1] = wholeModelSize
func (as *App) ReturnProgress() []int64 {
	progressMutex.Lock()
	defer progressMutex.Unlock()
	log.Warn("returning progress", "pullProgress: ", pullProgress, "wholeModelSize: ", wholeModelSize)
	return []int64{pullProgress, wholeModelSize}
}

func ApiReqStream(endpoint string, method string, jsonBody []byte) (string, error) {
	url := "http://localhost:11434" + endpoint
	req, err := http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}
	defer req.Body.Close()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	// Check the response status code
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("received non-200 response code: %d", resp.StatusCode)
	}

	// Read and process the stream of JSON objects
	decoder := json.NewDecoder(resp.Body)
	var status string
	for {
		var data map[string]interface{}
		if err := decoder.Decode(&data); err == io.EOF {
			break
		} else if err != nil {
			return "", fmt.Errorf("error decoding JSON response: %v", err)
		}

		if s, ok := data["status"].(string); ok {
			status = s
			log.Info("Streaming status:", "status", status)
			// Process the status here as needed
			if status == "success" {
				break
			}
		}

		// Update progress if current and total fields are present
		if current, ok := data["completed"].(float64); ok {
			if total, ok := data["total"].(float64); ok {
				updateProgress(int64(current), int64(total))
			}
		}
	}

	return status, nil
}

// return index 0 = status, index 1 = error
//
// this one uses stream: true
// couse i wanna display a progress bar 💀
func (as *App) PullModelStream(name string) []string {
	endpoint := "/api/pull"

	log.Info("Pulling model:", "name", name)
	// Prepare request body
	requestBody, err := json.Marshal(map[string]interface{}{
		"name":   name,
		"stream": true, // Set to true for streaming response
	})
	if err != nil {
		log.Error("Error marshaling request body:", "err", err)
		return []string{"", fmt.Sprint(err)}
	}

	// Make POST request
	status, err := ApiReqStream(endpoint, "POST", requestBody)
	if err != nil {
		log.Error("Error making API request:", "err", err)
		return []string{"", fmt.Sprint(err)}
	}

	if status == "success" {
		log.Info("Model pulled successfully:", "name", name, "status", status)
		return []string{status, status}
	}

	return []string{"", fmt.Sprintf("failed to pull model: %s", name)}
}
