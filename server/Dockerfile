# ---- Stage 1: Build ----
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Cache module downloads before copying source.
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build a static binary with CGO disabled.
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app/server .

# ---- Stage 2: Runtime ----
FROM alpine:3.19

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

ENTRYPOINT ["./server"]
