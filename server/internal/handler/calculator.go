// Package handler provides HTTP handlers for the calculator API.
package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/antigravity/fullstack-calculator/server/internal/model"
	"github.com/antigravity/fullstack-calculator/server/internal/service"
	"github.com/antigravity/fullstack-calculator/server/internal/validator"
)

// Handler groups the HTTP handlers and their dependencies.
type Handler struct {
	calc *service.Calculator
}

// New creates a Handler wired to the given Calculator service.
func New(calc *service.Calculator) *Handler {
	return &Handler{calc: calc}
}

// Calculate handles POST /api/calculate.
func (h *Handler) Calculate(w http.ResponseWriter, r *http.Request) {
	var req model.CalculateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON: "+err.Error())
		return
	}

	if err := validator.Validate(req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.calc.Calculate(req.Operation, *req.A, req.B)
	if err != nil {
		// Domain errors (division by zero, sqrt of negative, …) are
		// returned as 422 Unprocessable Entity.
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, model.CalculateResponse{
		Success:    true,
		Result:     result.Value,
		Operation:  req.Operation,
		Expression: result.Expression,
	})
}

// Root handles GET / and returns a discovery document with all available endpoints.
func (h *Handler) Root(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"service": "Calculator API",
		"version": "1.0.0",
		"endpoints": []map[string]string{
			{
				"method":      "GET",
				"path":        "/",
				"description": "API discovery — lists all available endpoints",
			},
			{
				"method":      "GET",
				"path":        "/api/v1/health",
				"description": "Health check — returns service status and timestamp",
			},
			{
				"method":      "POST",
				"path":        "/api/v1/calculate",
				"description": "Perform a calculation. Body: {\"operation\": \"add|subtract|multiply|divide|power|sqrt|percentage\", \"a\": number, \"b\": number}",
			},
		},
	})
}

// Health handles GET /api/health.
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, model.HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// writeJSON serialises v as JSON and writes it to the response.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// writeError sends a standard error response.
func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, model.ErrorResponse{
		Success: false,
		Error:   message,
	})
}
