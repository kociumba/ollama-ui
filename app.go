package main

import (
	"bytes"
	"context"
	"encoding/json"
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
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	// Context string `json:"context"`
	Stream bool `json:"stream"`
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

type Models struct {
	Models []Model `json:"models"`
}

type Model struct {
	Name string `json:"name"`
}

var models Models

var requestBody = RequestBody{
	Model:  "dolphincoder",
	Prompt: "",
	// Context: "This is the first message in the conversation anwser professionally",
	Stream: false,
}

// always call SetModel() before GetResponse(), if not called before it will default to "dolphincoder"
func (as *App) SetModel(Model string) bool {
	requestBody.Model = Model

	log.Info("Setting model to:", "Model", Model)

	// we need to check if the model is installed

	models := GetModels()

	for _, model := range models.Models {
		if strings.Contains(model.Name, Model) {
			log.Info("Model found:", "Model", model.Name)
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
	You can use the the following in you response: 
	markdown which will be rendered according to it's syntax, 
	html outside of markdown codeblocks will be rendered according to it's syntax,
	links are going to be openable when embedded with markdown.
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

	return response.Response
	// return false
}

func GetModels() Models {

	url := "http://localhost:11434/api/tags"
	req, err := http.Get(url)
	if err != nil {
		log.Error("Error creating request:", "err", err)
		return Models{}
	}
	defer req.Body.Close()

	body, err := io.ReadAll(req.Body)
	if err != nil {
		log.Error("Error reading response body: %v\n", "err", err)
		return Models{}
	}

	err = json.Unmarshal(body, &models)
	if err != nil {
		log.Error("Error parsing JSON response: %v\n", "err", err)
		return Models{}
	}

	return models
}
