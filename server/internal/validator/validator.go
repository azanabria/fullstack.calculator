// Package validator provides input validation for calculator requests.
package validator

import (
	"fmt"
	"math"

	"github.com/antigravity/fullstack-calculator/server/internal/model"
)

// SupportedOperations is the set of operations the calculator can perform.
var SupportedOperations = map[string]bool{
	"add":        true,
	"subtract":   true,
	"multiply":   true,
	"divide":     true,
	"power":      true,
	"sqrt":       true,
	"percentage": true,
}

// Validate checks the incoming request for missing or invalid fields and
// returns a human-readable error message if validation fails.
func Validate(req model.CalculateRequest) error {
	// Operation must be provided.
	if req.Operation == "" {
		return fmt.Errorf("Operation is required")
	}

	// Operation must be one we recognise.
	if !SupportedOperations[req.Operation] {
		return fmt.Errorf("Invalid operation: %s. Supported operations: add, subtract, multiply, divide, power, sqrt, percentage", req.Operation)
	}

	// Operand A is always required.
	if req.A == nil {
		return fmt.Errorf("Operand 'a' is required")
	}

	// Guard against non-finite numbers (NaN, ±Inf).
	if math.IsNaN(*req.A) || math.IsInf(*req.A, 0) {
		return fmt.Errorf("Operand 'a' must be a finite number")
	}

	// For binary operations, operand B is required.
	if req.Operation != "sqrt" {
		if req.B == nil {
			return fmt.Errorf("Operand 'b' is required for operation: %s", req.Operation)
		}
		if math.IsNaN(*req.B) || math.IsInf(*req.B, 0) {
			return fmt.Errorf("Operand 'b' must be a finite number")
		}
	}

	return nil
}
