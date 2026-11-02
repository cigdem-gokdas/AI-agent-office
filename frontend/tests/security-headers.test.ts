import {describe,it,expect} from 'vitest';
import {securityHeaders} from '../security/headers';
describe('security headers',()=>{
 it('blocks framing, external scripts and device access',()=>{const h=securityHeaders('a'.repeat(32));expect(h['Content-Security-Policy']).toContain("script-src 'self' 'nonce-");expect(h['Content-Security-Policy']).not.toContain('unsafe-eval');expect(h['Content-Security-Policy']).toContain("frame-ancestors 'none'");expect(h['X-Frame-Options']).toBe('DENY');expect(h['Permissions-Policy']).toContain('microphone=()');});
 it('has no websocket exception unless explicitly configured for development',()=>{expect(securityHeaders('a'.repeat(32))['Content-Security-Policy']).not.toContain('ws://');expect(securityHeaders('a'.repeat(32),true)['Content-Security-Policy']).toContain('ws://127.0.0.1:5173');});
 it('rejects header injection',()=>{expect(()=>securityHeaders('bad\r\nX-Test: yes')).toThrow();});
});
