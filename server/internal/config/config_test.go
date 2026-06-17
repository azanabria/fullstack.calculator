package config

import (
	"testing"
)

func TestLoadDefaults(t *testing.T) {
	// Ensure no env vars are set that could interfere.
	t.Setenv("APP_ENV", "")
	t.Setenv("PORT", "")
	t.Setenv("CORS_ORIGINS", "")
	t.Setenv("LOG_REQUESTS", "")

	cfg := Load()

	if cfg.Env != EnvDevelopment {
		t.Errorf("expected env %q, got %q", EnvDevelopment, cfg.Env)
	}
	if cfg.Port != "8080" {
		t.Errorf("expected port 8080, got %s", cfg.Port)
	}
	if len(cfg.CORSOrigins) != 2 {
		t.Errorf("expected 2 default CORS origins, got %d", len(cfg.CORSOrigins))
	}
	if !cfg.LogRequests {
		t.Error("expected LogRequests to default to true")
	}
	if !cfg.IsDevelopment() {
		t.Error("expected IsDevelopment() to be true")
	}
	if cfg.IsProduction() {
		t.Error("expected IsProduction() to be false")
	}
}

func TestLoadFromEnv(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("PORT", "9090")
	t.Setenv("CORS_ORIGINS", "https://calc.example.com, https://staging.example.com")
	t.Setenv("LOG_REQUESTS", "false")

	cfg := Load()

	if cfg.Env != EnvProduction {
		t.Errorf("expected env %q, got %q", EnvProduction, cfg.Env)
	}
	if cfg.Port != "9090" {
		t.Errorf("expected port 9090, got %s", cfg.Port)
	}
	if len(cfg.CORSOrigins) != 2 {
		t.Fatalf("expected 2 CORS origins, got %d", len(cfg.CORSOrigins))
	}
	if cfg.CORSOrigins[0] != "https://calc.example.com" {
		t.Errorf("unexpected first origin: %s", cfg.CORSOrigins[0])
	}
	if cfg.CORSOrigins[1] != "https://staging.example.com" {
		t.Errorf("unexpected second origin: %s", cfg.CORSOrigins[1])
	}
	if cfg.LogRequests {
		t.Error("expected LogRequests to be false")
	}
	if !cfg.IsProduction() {
		t.Error("expected IsProduction() to be true")
	}
}

func TestSplitCSVEmpty(t *testing.T) {
	result := splitCSV("")
	if len(result) != 0 {
		t.Errorf("expected empty slice, got %v", result)
	}
}

func TestSplitCSVSingle(t *testing.T) {
	result := splitCSV("http://localhost:3000")
	if len(result) != 1 || result[0] != "http://localhost:3000" {
		t.Errorf("unexpected result: %v", result)
	}
}
