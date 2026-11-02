// Package outbound contains an unregistered, read-only HTTP primitive.
// It is not an OAuth client, workflow executor, or complete account integration.
package outbound

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

var ErrDenied = errors.New("outbound operation denied")
var ErrUnavailable = errors.New("outbound authorization or transport unavailable")

// Reader has no write, email-send, delete, token-storage, or authentication-flow methods.
// A trusted host must authorize every call independently of this transport.
type Reader struct {
	targets map[string]string
	token   func(context.Context) (string, error)
	client  *http.Client
	mu      sync.Mutex
	window  time.Time
	calls   int
}

func NewReader(targets map[string]string, token func(context.Context) (string, error)) (*Reader, error) {
	if len(targets) == 0 || len(targets) > 32 || token == nil {
		return nil, ErrDenied
	}
	copyTargets := map[string]string{}
	for name, raw := range targets {
		u, e := url.Parse(raw)
		if e != nil || name == "" || u.Scheme != "https" || u.User != nil || u.Fragment != "" || u.RawQuery != "" || u.Opaque != "" || u.Path == "" || strings.ContainsAny(u.Path, "\\\r\n") || (u.Host != "api.notion.com" && u.Host != "gmail.googleapis.com") {
			return nil, ErrDenied
		}
		copyTargets[name] = raw
	}
	return &Reader{targets: copyTargets, token: token, client: &http.Client{Timeout: 8 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return ErrDenied }}}, nil
}

// ReadJSON accepts a configured logical name, never a URL from imported content.
// It makes one GET, bounds bytes/time, and never retries or logs response bodies.
func (r *Reader) ReadJSON(ctx context.Context, target string) (map[string]any, error) {
	raw, ok := r.targets[target]
	if !ok {
		return nil, ErrDenied
	}
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}
	ctx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	r.mu.Lock()
	if r.window.IsZero() || time.Since(r.window) >= time.Minute {
		r.window = time.Now()
		r.calls = 0
	}
	r.calls++
	count := r.calls
	r.mu.Unlock()
	if count > 30 {
		return nil, ErrDenied
	}
	token, e := r.token(ctx)
	if e != nil || token == "" {
		return nil, ErrUnavailable
	}
	req, e := http.NewRequestWithContext(ctx, http.MethodGet, raw, nil)
	if e != nil {
		return nil, ErrDenied
	}
	req.Header.Set("Authorization", "Bearer "+token)
	// This version header is harmless to Gmail; the host must review API compatibility.
	if req.URL.Host == "api.notion.com" {
		req.Header.Set("Notion-Version", "2025-09-03")
	}
	response, e := r.client.Do(req)
	if e != nil {
		return nil, ErrUnavailable
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		return nil, ErrUnavailable
	}
	body, e := io.ReadAll(io.LimitReader(response.Body, 512*1024+1))
	if e != nil || len(body) > 512*1024 {
		return nil, ErrUnavailable
	}
	var out map[string]any
	if json.Unmarshal(body, &out) != nil || out == nil {
		return nil, ErrUnavailable
	}
	return out, nil
}
