package ownerbridge
import("testing";"net/http/httptest";"strings")
func TestCapabilities(t *testing.T){a,b:=NewSecret(),NewSecret();if len(a)!=64||a==b||!EqualSecret(a,a)||EqualSecret(a,b)||EqualSecret("",""){t.Fatal("capability failure")}}
func TestStrictBoundedJSON(t *testing.T){for _,body:=range []string{`{"extra":true}`,`{} {}`,strings.Repeat("x",9000)}{r:=httptest.NewRequest("POST","http://127.0.0.1/",strings.NewReader(body));r.Header.Set("Content-Type","application/json");w:=httptest.NewRecorder();if DecodeJSON(w,r,&struct{}{}){t.Fatal("invalid JSON accepted")}}}
