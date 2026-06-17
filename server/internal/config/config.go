// Package config provides centralised configuration loaded from environment
// variables. Every setting has a sensible default for local development so
// the service can start with zero configuration.
package config

import (
	"log"
	"os"
	"strings"
)

// Environment names.
const (
	EnvDevelopment = "development"
	EnvStaging     = "staging"
	EnvProduction  = "production"
)

// Config holds all runtime configuration for the API server.
type Config struct {
	// Env is the runtime environment (development, staging, production).
	Env string

	// Port the HTTP server listens on.
	Port string

	// CORSOrigins is the list of allowed CORS origins.
	CORSOrigins []string

	// LogRequests enables the chi request-logger middleware.
	LogRequests bool
}

// Load reads configuration from environment variables and returns a Config
// with defaults applied for any unset values.
func Load() *Config {
	cfg := &Config{
		Env:         getEnv("APP_ENV", EnvDevelopment),
		Port:        getEnv("PORT", "8080"),
		CORSOrigins: splitCSV(getEnv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")),
		LogRequests: getEnv("LOG_REQUESTS", "true") == "true",
	}

	log.Printf("[config] env=%s port=%s cors_origins=%v log_requests=%v",
		cfg.Env, cfg.Port, cfg.CORSOrigins, cfg.LogRequests)

	return cfg
}

// IsDevelopment returns true when running in the development environment.
func (c *Config) IsDevelopment() bool { return c.Env == EnvDevelopment }

// IsProduction returns true when running in the production environment.
func (c *Config) IsProduction() bool { return c.Env == EnvProduction }

// getEnv returns the environment variable value or the provided fallback.
func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// splitCSV splits a comma-separated string into a trimmed slice.
func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}
