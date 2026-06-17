package validator

import (
	"math"
	"testing"

	"github.com/antigravity/fullstack-calculator/server/internal/model"
)

func TestValidate(t *testing.T) {
	num := func(v float64) *float64 { return &v }

	tests := []struct {
		name    string
		req     model.CalculateRequest
		wantErr bool
	}{
		{
			name: "Valid binary operation",
			req: model.CalculateRequest{
				Operation: "add",
				A:         num(5),
				B:         num(10),
			},
			wantErr: false,
		},
		{
			name: "Valid unary operation",
			req: model.CalculateRequest{
				Operation: "sqrt",
				A:         num(16),
			},
			wantErr: false,
		},
		{
			name: "Missing operation",
			req: model.CalculateRequest{
				A: num(5),
				B: num(10),
			},
			wantErr: true,
		},
		{
			name: "Missing operand A",
			req: model.CalculateRequest{
				Operation: "add",
				B:         num(10),
			},
			wantErr: true,
		},
		{
			name: "Missing operand B for binary operation",
			req: model.CalculateRequest{
				Operation: "add",
				A:         num(5),
			},
			wantErr: true,
		},
		{
			name: "NaN operand A",
			req: model.CalculateRequest{
				Operation: "add",
				A:         num(math.NaN()),
				B:         num(10),
			},
			wantErr: true,
		},
		{
			name: "Inf operand B",
			req: model.CalculateRequest{
				Operation: "add",
				A:         num(5),
				B:         num(math.Inf(1)),
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
