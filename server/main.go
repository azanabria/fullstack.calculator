// Package main is the entry point for the calculator API server.
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/antigravity/fullstack-calculator/server/internal/config"
	"github.com/antigravity/fullstack-calculator/server/internal/handler"
	"github.com/antigravity/fullstack-calculator/server/internal/service"
)

func main() {
	// Load configuration from environment variables.
	cfg := config.Load()

	// Create core dependencies.
	calc := service.NewCalculator()
	h := handler.New(calc)

	// Build the router.
	r := chi.NewRouter()

	// Middleware stack.
	if cfg.LogRequests {
		r.Use(middleware.Logger)
	}
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes.
	r.Get("/", h.Root)
	r.Post("/api/v1/calculate", h.Calculate)
	r.Get("/api/v1/health", h.Health)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Calculator API listening on %s (env=%s)", addr, cfg.Env)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
