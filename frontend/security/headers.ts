// Apply these headers in a separately reviewed host; importing does not serve HTTP.
export function securityHeaders(nonce: string, development = false): Record<string,string> {
 if (!/^[A-Za-z0-9+/=]{32}$/.test(nonce)) throw new Error('Invalid CSP nonce');
 return {
 'Content-Security-Policy': `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'${development ? ' ws://127.0.0.1:5173' : ''}; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`,
 'X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 };
}
