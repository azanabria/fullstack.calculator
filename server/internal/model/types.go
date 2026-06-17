// Package model defines the request and response types for the calculator API.
package model

// CalculateRequest represents an incoming calculation request.
// The field B is a pointer so that it can be nil (omitted) for unary
// operations such as sqrt.
type CalculateRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b,omitempty"`
}

// CalculateResponse is returned on a successful calculation.
type CalculateResponse struct {
	Success    bool    `json:"success"`
	Result     float64 `json:"result"`
	Operation  string  `json:"operation"`
	Expression string  `json:"expression"`
}

// ErrorResponse is returned when the request cannot be fulfilled.
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// HealthResponse is returned by the health-check endpoint.
type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
}
