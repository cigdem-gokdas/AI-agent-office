import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {securityHeaders} from '../frontend/security/headers';
const nonce=randomBytes(24).toString('base64');
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),html:{cspNonce:nonce},plugins:[react(),tailwind()],server:{host:'127.0.0.1',port:5175,strictPort:true,open:false,cors:false,allowedHosts:['127.0.0.1'],headers:{...securityHeaders(nonce), 'Content-Security-Policy':securityHeaders(nonce)['Content-Security-Policy'].replace("connect-src 'self'","connect-src 'self' ws://127.0.0.1:5175")},fs:{strict:true,deny:['**/.git/**','**/.env*','**/.local/**','**/*.{pem,key,p12,pfx}']}},preview:{host:'127.0.0.1',port:4175,strictPort:true,headers:securityHeaders(nonce)},build:{outDir:'../dist-ui',emptyOutDir:true,sourcemap:false,chunkSizeWarningLimit:1200}});
