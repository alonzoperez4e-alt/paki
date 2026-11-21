import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { processRegistration } from './api/register.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000;

interface ServerLead {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string;
  storeName: string;
  city: string;
  consent: boolean;
  emailStatus: 'enviado' | 'pendiente_smtp' | 'guardado_local';
}

const serverLeads: ServerLead[] = [];

// Admin passcode state: env var always takes precedence; otherwise supports a one-time first-run claim.
let claimedAdminHash: { salt: string; hash: string } | null = null;
const activeSessions = new Map<string, number>();

function getEnvPasscode(): string {
  return (process.env.ADMIN_PANEL_PASSCODE || '').trim();
}

function hashPasscode(passcode: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash: derived };
}

function timingSafeStringMatch(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function verifyAdminPasscode(candidate: string): boolean {
  const envPass = getEnvPasscode();
  if (envPass) {
    return timingSafeStringMatch(candidate, envPass);
  }
  if (claimedAdminHash) {
    const derived = hashPasscode(candidate, claimedAdminHash.salt);
    return crypto.timingSafeEqual(
      Buffer.from(derived.hash, 'hex'),
      Buffer.from(claimedAdminHash.hash, 'hex'),
    );
  }
  return false;
}

function issueSessionToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const expiry = activeSessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

function extractBearerToken(authHeader: string | undefined): string | undefined {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  return authHeader.slice('Bearer '.length).trim();
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/register', async (req, res) => {
    try {
      const result = await processRegistration(req.body);
      if (result.status === 200 && result.payload.ok && result.payload.lead) {
        serverLeads.unshift(result.payload.lead as ServerLead);
        if (serverLeads.length > 500) {
          serverLeads.length = 500;
        }
      }
      res.status(result.status).json(result.payload);
    } catch (error) {
      console.error('Error en /api/register:', error instanceof Error ? error.message : 'Unknown error');
      res.status(500).json({
        ok: false,
        error:
          'No pudimos enviar el correo en este momento. Tus datos fueron respaldados localmente; intenta nuevamente o confirma por WhatsApp.',
      });
    }
  });

  app.get('/api/admin/status', (_req, res) => {
    const envPass = getEnvPasscode();
    if (envPass) {
      res.json({ configured: true, source: 'env' });
      return;
    }
    if (claimedAdminHash) {
      res.json({ configured: true, source: 'claimed' });
      return;
    }
    res.json({ configured: false, source: 'none' });
  });

  app.post('/api/admin/claim', (req, res) => {
    if (getEnvPasscode() || claimedAdminHash) {
      res.status(409).json({
        ok: false,
        error: 'La clave de administrador ya está configurada. Inicia sesión con tu clave.',
      });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 6 || passcode.length > 100) {
      res.status(400).json({
        ok: false,
        error: 'Define una clave de al menos 6 caracteres para proteger el panel.',
      });
      return;
    }

    claimedAdminHash = hashPasscode(passcode);
    const token = issueSessionToken();
    res.status(201).json({ ok: true, token });
  });

  app.post('/api/admin/login', (req, res) => {
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode) {
      res.status(400).json({ ok: false, error: 'Ingresa tu clave de acceso.' });
      return;
    }

    if (!verifyAdminPasscode(passcode)) {
      res.status(401).json({ ok: false, error: 'Clave incorrecta. Intenta nuevamente.' });
      return;
    }

    const token = issueSessionToken();
    res.json({ ok: true, token });
  });

  app.post('/api/admin/logout', (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (token) {
      activeSessions.delete(token);
    }
    res.json({ ok: true });
  });

  app.get('/api/leads', (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isTokenValid(token)) {
      res.status(401).json({ ok: false, error: 'Sesión no autorizada o expirada.' });
      return;
    }
    res.json({ ok: true, leads: serverLeads });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paki server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
