package service

import (
	"math"
	"testing"
)

// helper to get a *float64 from a literal.
func ptrF(v float64) *float64 { return &v }

func TestAdd(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("add", 10, ptrF(5))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 15 {
		t.Errorf("expected 15, got %g", r.Value)
	}
}

func TestSubtract(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("subtract", 10, ptrF(3))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 7 {
		t.Errorf("expected 7, got %g", r.Value)
	}
}

func TestMultiply(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("multiply", 4, ptrF(5))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 20 {
		t.Errorf("expected 20, got %g", r.Value)
	}
}

func TestDivide(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("divide", 20, ptrF(4))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 5 {
		t.Errorf("expected 5, got %g", r.Value)
	}
}

func TestDivideByZero(t *testing.T) {
	c := NewCalculator()
	_, err := c.Calculate("divide", 10, ptrF(0))
	if err == nil {
		t.Fatal("expected error for division by zero")
	}
}

func TestPower(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("power", 2, ptrF(10))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 1024 {
		t.Errorf("expected 1024, got %g", r.Value)
	}
}

func TestPowerOverflow(t *testing.T) {
	c := NewCalculator()
	_, err := c.Calculate("power", 10, ptrF(1000))
	if err == nil {
		t.Fatal("expected error for non-finite result")
	}
}

func TestSqrt(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("sqrt", 16, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 4 {
		t.Errorf("expected 4, got %g", r.Value)
	}
}

func TestSqrtNegative(t *testing.T) {
	c := NewCalculator()
	_, err := c.Calculate("sqrt", -4, nil)
	if err == nil {
		t.Fatal("expected error for sqrt of negative number")
	}
}

func TestPercentage(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("percentage", 20, ptrF(200))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 40 {
		t.Errorf("expected 40, got %g", r.Value)
	}
}

func TestAddNegativeNumbers(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("add", -5, ptrF(-3))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != -8 {
		t.Errorf("expected -8, got %g", r.Value)
	}
}

func TestSqrtZero(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("sqrt", 0, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.Value != 0 {
		t.Errorf("expected 0, got %g", r.Value)
	}
}

func TestDivideDecimalResult(t *testing.T) {
	c := NewCalculator()
	r, err := c.Calculate("divide", 10, ptrF(3))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := 10.0 / 3.0
	if math.Abs(r.Value-expected) > 1e-10 {
		t.Errorf("expected %g, got %g", expected, r.Value)
	}
}

func TestUnknownOperation(t *testing.T) {
	c := NewCalculator()
	_, err := c.Calculate("modulo", 10, ptrF(3))
	if err == nil {
		t.Fatal("expected error for unknown operation")
	}
}
