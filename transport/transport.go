package ownerbridge

import (
	"bytes"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"reflect"
	"strings"
	"unicode/utf8"
)

// NewSecret produces a 256-bit capability; callers must never log it.
func NewSecret() string {
	var b [32]byte
	if _, e := rand.Read(b[:]); e != nil {
		panic(e)
	}
	return hex.EncodeToString(b[:])
}
func EqualSecret(a, b string) bool {
	return a != "" && b != "" && subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}
func WriteJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}
func DecodeJSON(w http.ResponseWriter, r *http.Request, v any) bool {
	if r.Header.Get("Content-Type") != "application/json" {
		WriteJSON(w, 415, map[string]string{"error": "JSON required"})
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, 8192)
	body, e := io.ReadAll(r.Body)
	if e != nil || r.Context().Err() != nil || !strictJSON(body, v) {
		WriteJSON(w, 400, map[string]string{"error": "Invalid, ambiguous or oversized request"})
		return false
	}
	return true
}

// Reject duplicate object keys (including case aliases) before Go's permissive
// field matching can silently select a different owner decision.
func strictJSON(body []byte, v any) bool {
	if !utf8.Valid(body) {
		return false
	}
	d := json.NewDecoder(bytes.NewReader(body))
	d.UseNumber()
	if jsonObject(d, 0) != nil {
		return false
	}
	if _, e := d.Token(); e != io.EOF {
		return false
	}
	// Wire DTOs use exact declared field names, not encoding/json's case aliases.
	typ := reflect.TypeOf(v)
	if typ == nil || typ.Kind() != reflect.Pointer || typ.Elem().Kind() != reflect.Struct || reflect.ValueOf(v).IsNil() {
		return false
	}
	allowed := map[string]bool{}
	for i := 0; i < typ.Elem().NumField(); i++ {
		f := typ.Elem().Field(i)
		name := strings.Split(f.Tag.Get("json"), ",")[0]
		if name == "" {
			name = f.Name
		}
		allowed[name] = true
	}
	var fields map[string]json.RawMessage
	if json.Unmarshal(body, &fields) != nil || fields == nil {
		return false
	}
	for key := range fields {
		if !allowed[key] {
			return false
		}
	}
	d = json.NewDecoder(bytes.NewReader(body))
	d.DisallowUnknownFields()
	return d.Decode(v) == nil
}
func jsonObject(d *json.Decoder, depth int) error {
	if depth > 16 {
		return errors.New("JSON nesting limit")
	}
	token, e := d.Token()
	if e != nil {
		return e
	}
	delim, ok := token.(json.Delim)
	if !ok {
		return nil
	}
	switch delim {
	case '{':
		seen := []string{}
		for d.More() {
			key, e := d.Token()
			if e != nil {
				return e
			}
			name, ok := key.(string)
			if !ok {
				return errors.New("object key required")
			}
			for _, prior := range seen {
				if strings.EqualFold(name, prior) {
					return errors.New("duplicate key")
				}
			}
			seen = append(seen, name)
			if e = jsonObject(d, depth+1); e != nil {
				return e
			}
		}
	case '[':
		for d.More() {
			if e = jsonObject(d, depth+1); e != nil {
				return e
			}
		}
	default:
		return errors.New("unexpected JSON delimiter")
	}
	_, e = d.Token()
	return e
}
