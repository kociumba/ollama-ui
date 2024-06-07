package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/charmbracelet/log"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

type RequestBody struct {
	Model   string `json:"model"`
	Prompt  string `json:"prompt"`
	Context []int  `json:"context"`
	Stream  bool   `json:"stream"`
}

type Response struct {
	Model           string    `json:"model"`
	CreatedAt       time.Time `json:"created_at"`
	Response        string    `json:"response"`
	Done            bool      `json:"done"`
	Context         []int     `json:"context"`
	TotalDuration   int64     `json:"total_duration"`
	LoadDuration    int64     `json:"load_duration"`
	PromptEvalCount int       `json:"prompt_eval_count"`
	PromptEvalDur   int64     `json:"prompt_eval_duration"`
	EvalCount       int       `json:"eval_count"`
	EvalDuration    int64     `json:"eval_duration"`
}

type Model struct {
	Name       string `json:"name"`
	ModifiedAt string `json:"modified_at"`
	Size       int    `json:"size"`
	Digest     string `json:"digest"`
	Details    struct {
		Format            string      `json:"format"`
		Family            string      `json:"family"`
		Families          interface{} `json:"families"`
		ParameterSize     string      `json:"parameter_size"`
		QuantizationLevel string      `json:"quantization_level"`
	} `json:"details"`
}

type Models struct {
	Models []Model `json:"models"`
}

var models Models

var requestBody = RequestBody{
	Model:  "dolphincoder:latest",
	Prompt: "",
	// Context: "This is the first message in the conversation anwser professionally",
	Stream: false,
}

var contexFromLastPrompt = []int{}

// always call SetModel() before GetResponse(), if not called before it will default to "dolphincoder"
func (as *App) SetModel(Model string) bool {
	requestBody.Model = Model

	log.Info("Setting model to:", "Model", Model)

	// we need to check if the model is installed

	models := GetModels()

	for _, model := range models.Models {
		if strings.Contains(model.Name, Model) {
			log.Info("Model found:", "Model", model.Name)

			requestBody.Model = model.Name

			log.Info("Setting model to:", "Model", requestBody.Model)

			return true
		}
	}

	log.Error("Model not found:", "Model", Model)
	return false
}

func (as *App) ListModels() []string {

	models := GetModels()
	modelsS := make([]string, len(models.Models))

	for _, model := range models.Models {
		modelsS = append(modelsS, model.Name)
	}

	return modelsS
}

func (as *App) GetResponse(prompt string) string {

	var prepromt = `
	Your response will be rendered as html so use it where needed,
	any markdown will be rendered according to it's syntax and will take priority over html stling,
	links, images, videos, iframes, etc will show up as expected when rendering html.
	This is the prompt you need to respond to:
	`

	requestBody.Prompt = prepromt + prompt

	log.Info("Marshaling request body:", "requestBody", requestBody)
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		log.Error("Error marshaling request body:", "err", err)
		// return true
	}

	log.Info("Sending a POST")
	url := "http://localhost:11434/api/generate?stream=false"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Error("Error creating request:", "err", err)
		// return true
	}

	log.Info("Setting headers")
	req.Header.Set("Content-Type", "application/json")

	log.Info("Sending request")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error("Error sending request:", "err", err)
		// return true
	}
	defer resp.Body.Close()

	log.Info("Reading response")
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Error("Error reading response body:", "err", err)
		// return true
	}

	log.Info("Unmarshaling response")
	var response Response
	err = json.Unmarshal(body, &response)
	if err != nil {
		log.Error("Error unmarshaling response:", "err", err)
		// return true
	}

	log.Info("Printing response")
	log.Infof("%+v\n", response.Response)

	requestBody.Context = append(requestBody.Context, response.Context...)

	return response.Response
	// return false
}

func GetModels() Models {
	endpoint := "/api/tags"
	body := ApiReq(endpoint, "GET", nil)

	var models Models
	err := json.Unmarshal(body, &models)
	if err != nil {
		log.Fatalf("Error parsing JSON response: %v", err)
		return Models{}
	}

	return models
}

type IsDone struct {
	Status string `json:"status"`
}

func (as *App) PullModel(name string) (string, error) {
	endpoint := "/api/pull"

	log.Info("Pulling model:", "name", name)
	// Prepare request body
	requestBody, err := json.Marshal(map[string]interface{}{
		"name":   name,
		"stream": false, // Optional: Set to true if you want a streaming response
	})
	if err != nil {
		log.Error("Error marshaling request body:", "err", err)
		return "", err
	}

	// Make POST request
	resp := ApiReq(endpoint, "POST", requestBody)

	// Handle response
	var data IsDone
	err = json.Unmarshal(resp, &data)
	if err != nil {
		log.Error("Error parsing JSON response:", "err", err)
		return "", err
	}

	if data.Status == "success" {
		log.Info("Model pulled:", "name", name)
		return data.Status, nil
	}

	return "", fmt.Errorf("failed to pull model: %s", name)
}

func ApiReq(endpoint string, method string, jsonBody []byte) []byte {
	url := "http://localhost:11434" + endpoint
	req, err := http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
		return nil
	}
	defer req.Body.Close()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error making request: %v", err)
		return nil
	}
	defer resp.Body.Close()

	result, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Error reading response body: %v", err)
		return nil
	}

	return result
}
