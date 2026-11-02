package outbound

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

type fakeTransport func(*http.Request) (*http.Response, error)

func (f fakeTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func TestBoundedReadOnlyTransport(t *testing.T) {
	targets := map[string]string{"profile": "https://gmail.googleapis.com/gmail/v1/users/me/profile"}
	r, e := NewReader(targets, func(context.Context) (string, error) { return "synthetic-test-capability", nil })
	if e != nil {
		t.Fatal(e)
	}
	targets["profile"] = "https://example.invalid/changed"
	calls := 0
	r.client.Transport = fakeTransport(func(req *http.Request) (*http.Response, error) {
		calls++
		if req.Method != "GET" || req.URL.Host != "gmail.googleapis.com" {
			t.Fatal("unsafe request")
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{"value":"synthetic"}`))}, nil
	})
	if _, e = r.ReadJSON(context.Background(), "unapproved"); !errors.Is(e, ErrDenied) || calls != 0 {
		t.Fatal("allowlist bypass")
	}
	if _, e = r.ReadJSON(context.Background(), "profile"); e != nil || calls != 1 {
		t.Fatal(e)
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, e = r.ReadJSON(ctx, "profile"); e == nil || calls != 1 {
		t.Fatal("cancellation")
	}
	if e = r.client.CheckRedirect(&http.Request{}, nil); e == nil {
		t.Fatal("redirect allowed")
	}
	for i := 1; i < 30; i++ {
		_, _ = r.ReadJSON(context.Background(), "profile")
	}
	if _, e = r.ReadJSON(context.Background(), "profile"); !errors.Is(e, ErrDenied) || calls != 30 {
		t.Fatal("rate limit")
	}
}
func TestInvalidTargets(t *testing.T) {
	for _, raw := range []string{"http://api.notion.com/v1/users/me", "https://evil.invalid/x", "https://api.notion.com:444/x", "https://sample-user:sample-pass@" + "api.notion.com/x", "https://api.notion.com/x?access_token=synthetic", "https://api.notion.com/x#fragment"} {
		if _, e := NewReader(map[string]string{"x": raw}, func(context.Context) (string, error) { return "", nil }); e == nil {
			t.Fatal("unsafe target")
		}
	}
}
func TestErrorsNeverExposeCredentialsOrResponseBody(t *testing.T) {
	for _, c := range []struct {
		status int
		body   string
	}{{401, "synthetic-private-response"}, {429, "synthetic-private-response"}, {200, strings.Repeat("x", 512*1024+1)}, {200, `{} {}`}, {200, `null`}} {
		r, _ := NewReader(map[string]string{"x": "https://api.notion.com/v1/users/me"}, func(context.Context) (string, error) { return "synthetic-private-capability", nil })
		r.client.Transport = fakeTransport(func(*http.Request) (*http.Response, error) {
			return &http.Response{StatusCode: c.status, Body: io.NopCloser(strings.NewReader(c.body))}, nil
		})
		if _, e := r.ReadJSON(context.Background(), "x"); e == nil || strings.Contains(e.Error(), "synthetic-private") {
			t.Fatal("unsafe error")
		}
	}
}
