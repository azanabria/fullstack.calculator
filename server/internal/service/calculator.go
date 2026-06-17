// Package service implements the core calculator logic, decoupled from HTTP
// transport so it can be tested and reused independently.
package service

import (
	"fmt"
	"math"
)

// Calculator performs arithmetic operations.
type Calculator struct{}

// NewCalculator returns a ready-to-use Calculator.
func NewCalculator() *Calculator {
	return &Calculator{}
}

// Result holds the outcome of a calculation, including a human-readable
// expression string.
type Result struct {
	Value      float64
	Expression string
}

// Calculate executes the requested operation and returns the result or an
// error for domain-level problems (division by zero, sqrt of negative, etc.).
func (c *Calculator) Calculate(operation string, a float64, b *float64) (Result, error) {
	switch operation {
	case "add":
		v := a + *b
		return Result{Value: v, Expression: fmt.Sprintf("%g + %g = %g", a, *b, v)}, nil

	case "subtract":
		v := a - *b
		return Result{Value: v, Expression: fmt.Sprintf("%g - %g = %g", a, *b, v)}, nil

	case "multiply":
		v := a * *b
		return Result{Value: v, Expression: fmt.Sprintf("%g × %g = %g", a, *b, v)}, nil

	case "divide":
		if *b == 0 {
			return Result{}, fmt.Errorf("Division by zero is not allowed")
		}
		v := a / *b
		return Result{Value: v, Expression: fmt.Sprintf("%g ÷ %g = %g", a, *b, v)}, nil

	case "power":
		v := math.Pow(a, *b)
		if math.IsInf(v, 0) || math.IsNaN(v) {
			return Result{}, fmt.Errorf("Result is not a finite number")
		}
		return Result{Value: v, Expression: fmt.Sprintf("%g ^ %g = %g", a, *b, v)}, nil

	case "sqrt":
		if a < 0 {
			return Result{}, fmt.Errorf("Cannot calculate square root of a negative number")
		}
		v := math.Sqrt(a)
		return Result{Value: v, Expression: fmt.Sprintf("√%g = %g", a, v)}, nil

	case "percentage":
		v := (a / 100) * *b
		return Result{Value: v, Expression: fmt.Sprintf("%g%% of %g = %g", a, *b, v)}, nil

	default:
		return Result{}, fmt.Errorf("Unknown operation: %s", operation)
	}
}
