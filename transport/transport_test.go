package ownerbridge

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCapabilities(t *testing.T) {
	a, b := NewSecret(), NewSecret()
	if len(a) != 64 || a == b || !EqualSecret(a, a) || EqualSecret(a, b) || EqualSecret("", "") {
		t.Fatal("capability failure")
	}
}

type request struct {
	Confirm bool           `json:"confirm"`
	Fields  map[string]any `json:"fields"`
}

func TestStrictBoundedJSON(t *testing.T) {
	for _, body := range []string{`{"extra":true}`, `{} {}`, strings.Repeat("x", 9000), `null`, `[]`, `{"confirm":true,"confirm":false}`, `{"confirm":true,"Confirm":false}`, `{"Confirm":true}`, `{"confirm":true,"\u0063onfirm":false}`, `{"fields":{"x":1,"x":2}}`, `{"fields":{"X":1,"x":2}}`, `{"fields":[{"k":1,"K":2}]}`, `{"fields":{"K":1,"\u212a":2}}`, `{"fields":` + strings.Repeat("[", 18) + `0` + strings.Repeat("]", 18) + `}`, string([]byte{'{', '"', 'x', '"', ':', '"', 0xff, '"', '}'})} {
		t.Run(body[:min(len(body), 60)], func(t *testing.T) {
			r := httptest.NewRequest("POST", "http://127.0.0.1/", strings.NewReader(body))
			r.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			var v request
			if DecodeJSON(w, r, &v) {
				t.Fatal("ambiguous JSON accepted")
			}
			if w.Code != 400 {
				t.Fatal(w.Code)
			}
		})
	}
}
func TestValidInputAndCancellation(t *testing.T) {
	r := httptest.NewRequest("POST", "http://127.0.0.1/", strings.NewReader(`{"confirm":true,"fields":{"label":"Synthetic"}}`))
	r.Header.Set("Content-Type", "application/json")
	var v request
	if !DecodeJSON(httptest.NewRecorder(), r, &v) || !v.Confirm {
		t.Fatal("valid request rejected")
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	r = r.WithContext(ctx)
	if DecodeJSON(httptest.NewRecorder(), r, &request{}) {
		t.Fatal("cancelled request accepted")
	}
}
func TestWrongMediaAndInvalidDestination(t *testing.T) {
	r := httptest.NewRequest("POST", "http://127.0.0.1/", strings.NewReader(`{}`))
	w := httptest.NewRecorder()
	if DecodeJSON(w, r, &request{}) || w.Code != 415 {
		t.Fatal("media type")
	}
	for _, dest := range []any{nil, (*request)(nil), map[string]any{}} {
		r := httptest.NewRequest("POST", "http://127.0.0.1/", strings.NewReader(`{}`))
		r.Header.Set("Content-Type", "application/json")
		if DecodeJSON(httptest.NewRecorder(), r, dest) {
			t.Fatal("invalid DTO accepted")
		}
	}
}
