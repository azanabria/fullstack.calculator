package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/antigravity/fullstack-calculator/server/internal/model"
	"github.com/antigravity/fullstack-calculator/server/internal/service"
)

func newTestHandler() *Handler {
	return New(service.NewCalculator())
}

// ---------- POST /api/calculate ----------

func TestCalculateAdd(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"add","a":10,"b":5}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resp model.CalculateResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if !resp.Success {
		t.Error("expected success=true")
	}
	if resp.Result != 15 {
		t.Errorf("expected result 15, got %g", resp.Result)
	}
	if resp.Operation != "add" {
		t.Errorf("expected operation 'add', got %q", resp.Operation)
	}
}

func TestCalculateSqrt(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"sqrt","a":25}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resp model.CalculateResponse
	_ = json.NewDecoder(w.Body).Decode(&resp)
	if resp.Result != 5 {
		t.Errorf("expected 5, got %g", resp.Result)
	}
}

func TestCalculateDivideByZero(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"divide","a":10,"b":0}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422, got %d", w.Code)
	}

	var resp model.ErrorResponse
	_ = json.NewDecoder(w.Body).Decode(&resp)
	if resp.Success {
		t.Error("expected success=false")
	}
}

func TestCalculateSqrtNegative(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"sqrt","a":-9}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422, got %d", w.Code)
	}
}

func TestCalculateInvalidJSON(t *testing.T) {
	h := newTestHandler()
	body := `{not valid json}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestCalculateMissingOperation(t *testing.T) {
	h := newTestHandler()
	body := `{"a":10,"b":5}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestCalculateInvalidOperation(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"modulo","a":10,"b":3}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestCalculateMissingOperandA(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"add","b":5}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestCalculateMissingOperandB(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"multiply","a":5}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}

func TestCalculatePercentage(t *testing.T) {
	h := newTestHandler()
	body := `{"operation":"percentage","a":25,"b":200}`
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Calculate(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resp model.CalculateResponse
	_ = json.NewDecoder(w.Body).Decode(&resp)
	if resp.Result != 50 {
		t.Errorf("expected 50, got %g", resp.Result)
	}
}

// ---------- GET /api/health ----------

func TestHealth(t *testing.T) {
	h := newTestHandler()
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	w := httptest.NewRecorder()

	h.Health(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resp model.HealthResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp.Status != "ok" {
		t.Errorf("expected status 'ok', got %q", resp.Status)
	}
	if resp.Timestamp == "" {
		t.Error("expected non-empty timestamp")
	}
}
