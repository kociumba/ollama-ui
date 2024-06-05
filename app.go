package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
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

func (as *App) GetResponse(prompt string) string {

	var requestBody = RequestBody{
		Model:  "dolphincoder",
		Prompt: prompt,
		// Context: "This is the first message in the conversation anwser professionally",
		Stream: false,
	}

	fmt.Println("Marshaling request body:", requestBody)
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Println("Error marshaling request body:", err)
		// return true
	}

	fmt.Println("Sending a POST")
	url := "http://localhost:11434/api/generate?stream=false"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		fmt.Println("Error creating request:", err)
		// return true
	}

	fmt.Println("Setting headers")
	req.Header.Set("Content-Type", "application/json")

	fmt.Println("Sending request")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		// return true
	}
	defer resp.Body.Close()

	fmt.Println("Reading response")
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		// return true
	}

	fmt.Println("Unmarshaling response")
	var response Response
	err = json.Unmarshal(body, &response)
	if err != nil {
		fmt.Println("Error unmarshaling response:", err)
		// return true
	}

	fmt.Println("Printing response")
	fmt.Printf("%+v\n", response.Response)

	return response.Response
	// return false
}
