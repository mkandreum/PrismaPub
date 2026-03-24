import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET_CURRENT = process.env.JWT_SECRET || '';
const JWT_SECRET_PREVIOUS = process.env.JWT_SECRET_PREVIOUS || '';

if (process.env.NODE_ENV === 'production' && !JWT_SECRET_CURRENT) {
  throw new Error('JWT_SECRET is required in production');
}

const getJwtSigningSecret = () => JWT_SECRET_CURRENT || 'prisma-pub-jwt-secret-change-me';

// Ensure directories
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
[dataDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const db = new Database(path.join(dataDir, 'prisma.db'));

const getSetting = (key: string, fallback = ''): string => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
};

const ensureSettingDefault = (key: string, value: string) => {
  const exists = db.prepare('SELECT 1 FROM settings WHERE key = ?').get(key);
  if (!exists) db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
};

const addColumnIfMissing = (table: string, column: string, definition: string) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getBaseUrl = (req: express.Request) => {
  const protoHeader = String(req.headers['x-forwarded-proto'] || req.protocol || 'http');
  const protocol = protoHeader.split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000');
  return `${protocol}://${host}`;
};

const normalizeBool = (value: string) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

async function loadEventImageAsBase64(imagePath: string): Promise<string | null> {
  try {
    if (!imagePath) return null;

    let buffer: Buffer;
    if (imagePath.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, imagePath.replace('/uploads/', ''));
      if (!fs.existsSync(filePath)) return null;
      buffer = fs.readFileSync(filePath);
    } else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      const response = await fetch(imagePath);
      if (!response.ok) return null;
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      return null;
    }

    const resized = await sharp(buffer).resize(1000, 580, { fit: 'cover' }).png().toBuffer();
    return `data:image/png;base64,${resized.toString('base64')}`;
  } catch {
    return null;
  }
}

async function buildTicketImageBuffer(ticket: {
  qr_code: string;
  user_name: string;
  event_title: string;
  event_date: string;
  event_time: string;
  ticket_type?: string;
  event_image?: string;
}) {
  const qrDataUrl = await QRCode.toDataURL(ticket.qr_code, { margin: 1, width: 400 });
  const ref = ticket.qr_code.split('-')[1] || ticket.qr_code;
  const dateStr = new Date(ticket.event_date).toLocaleDateString('en-GB');
  const titleLine = escapeHtml([...ticket.event_title].slice(0, 34).join(''));
  const nameLine = escapeHtml([...ticket.user_name].slice(0, 34).join(''));

  const sans = 'Liberation Sans, DejaVu Sans, Arial, Noto Color Emoji, sans-serif';
  const mono = 'Liberation Mono, DejaVu Sans Mono, Courier New, Noto Color Emoji, monospace';

  const imageDataUrl = await loadEventImageAsBase64(ticket.event_image || '');
  const imageTag = imageDataUrl && imageDataUrl.startsWith('data:image/')
    ? `<image href="${imageDataUrl}" x="40" y="40" width="1000" height="580" opacity="0.7" clip-path="url(#headerClip)"/>`
    : '';

  const rainbowColors = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#24408E', '#732982'];
  const flagStripes = rainbowColors
    .map((color, i) => `<rect x="910" y="${90 + i * 12}" width="80" height="12" fill="${color}"/>`)
    .join('\n  ');

  const svg = `<svg width="1080" height="1760" viewBox="0 0 1080 1760" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a14"/>
      <stop offset="55%" stop-color="#12102e"/>
      <stop offset="100%" stop-color="#1a0f3c"/>
    </linearGradient>
    <clipPath id="headerClip">
      <rect x="40" y="40" rx="96" ry="96" width="1000" height="580"/>
    </clipPath>
    <clipPath id="cardClip">
      <rect x="40" y="40" rx="96" ry="96" width="1000" height="1680"/>
    </clipPath>
    <filter id="qrShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#00000022"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1760" fill="url(#bgGrad)"/>

  <!-- White card -->
  <rect x="40" y="40" rx="96" ry="96" width="1000" height="1680" fill="#ffffff"/>

  <!-- Header: purple background -->
  <rect x="40" y="40" width="1000" height="580" fill="#8B5CF6" clip-path="url(#headerClip)"/>

  <!-- Header: event image overlay -->
  ${imageTag}

  <!-- PRISMA branding -->
  <text x="106" y="140" font-size="56" font-family="${sans}" font-weight="800" fill="#ffffff" letter-spacing="4">PRISMA</text>

  <!-- Pride flag -->
  ${flagStripes}

  <!-- Cutout circles at image/details boundary -->
  <circle cx="40" cy="620" r="36" fill="url(#bgGrad)"/>
  <circle cx="1040" cy="620" r="36" fill="url(#bgGrad)"/>

  <!-- Decorative curve -->
  <path d="M40,670 C290,770 790,570 1040,670" fill="none" stroke="rgba(168,85,247,0.15)" stroke-width="3"/>

  <!-- Event title -->
  <text x="106" y="754" font-size="64" font-family="${sans}" font-weight="800" fill="#0a0a14" letter-spacing="-1">${titleLine}</text>

  <!-- Details grid -->
  <text x="106" y="842" font-size="22" font-family="${sans}" font-weight="700" fill="#9ca3af" letter-spacing="4">DATE</text>
  <text x="106" y="878" font-size="32" font-family="${mono}" font-weight="600" fill="#111827">${dateStr}</text>

  <text x="560" y="842" font-size="22" font-family="${sans}" font-weight="700" fill="#9ca3af" letter-spacing="4">TIME</text>
  <text x="560" y="878" font-size="32" font-family="${mono}" font-weight="600" fill="#111827">${escapeHtml(ticket.event_time)}</text>

  <text x="106" y="954" font-size="22" font-family="${sans}" font-weight="700" fill="#9ca3af" letter-spacing="4">NAME</text>
  <text x="106" y="990" font-size="32" font-family="${mono}" font-weight="600" fill="#111827">${nameLine}</text>

  <text x="560" y="954" font-size="22" font-family="${sans}" font-weight="700" fill="#9ca3af" letter-spacing="4">REFERENCE</text>
  <text x="560" y="990" font-size="32" font-family="${mono}" font-weight="600" fill="#111827">${escapeHtml(ref)}</text>

  <!-- Dashed separator -->
  <line x1="80" y1="1080" x2="1000" y2="1080" stroke="#e5e7eb" stroke-width="3" stroke-dasharray="16,12"/>

  <!-- QR section -->
  <rect x="310" y="1130" rx="32" ry="32" width="460" height="460" fill="#ffffff" filter="url(#qrShadow)"/>
  <image href="${qrDataUrl}" x="340" y="1160" width="400" height="400"/>

  <!-- QR code text -->
  <text x="540" y="1640" text-anchor="middle" font-size="22" font-family="${mono}" fill="#9ca3af" letter-spacing="3">${escapeHtml(ticket.qr_code)}</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function sendTicketEmail(req: express.Request, payload: {
  qr_code: string;
  user_name: string;
  user_email: string;
  event_title: string;
  event_date: string;
  event_time: string;
  ticket_type?: string;
  event_image?: string;
}) {
  const smtpEnabled = normalizeBool(getSetting('smtp_enabled', '0'));
  if (!smtpEnabled) {
    return { sent: false, skipped: true, reason: 'SMTP disabled' };
  }

  const host = getSetting('smtp_host');
  const port = Number(getSetting('smtp_port', '587'));
  const user = getSetting('smtp_user');
  const pass = getSetting('smtp_pass');
  const secure = normalizeBool(getSetting('smtp_secure', '0'));
  const fromName = getSetting('smtp_from_name', 'PRISMA PUB');
  const fromEmail = getSetting('smtp_from_email', user);

  if (!host || !port || !fromEmail) {
    throw new Error('SMTP no configurado correctamente en Ajustes');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  const ticketImage = await buildTicketImageBuffer(payload);
  const ticketUrl = `${getBaseUrl(req)}/ticket/${encodeURIComponent(payload.qr_code)}`;

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: payload.user_email,
    subject: `Tu entrada para ${payload.event_title} · PRISMA PUB`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px;">¡Tu entrada está lista! 🎉</h2>
        <p style="margin-top: 0; color: #4b5563;">Evento: <strong>${escapeHtml(payload.event_title)}</strong></p>
        <p style="color: #4b5563;">Fecha: ${escapeHtml(new Date(payload.event_date).toLocaleDateString('en-GB'))} · Hora: ${escapeHtml(payload.event_time)}</p>
        <p style="color: #4b5563;">Adjuntamos tu entrada en imagen. También puedes verla online:</p>
        <p><a href="${ticketUrl}" style="display:inline-block;background:#8B5CF6;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;">Ver entrada online</a></p>
        <img src="cid:ticket-image" alt="Entrada" style="width:100%;max-width:520px;border-radius:16px;border:1px solid #e5e7eb;margin-top:12px;"/>
      </div>
    `,
    attachments: [
      { filename: `entrada-${payload.qr_code}.png`, content: ticketImage, cid: 'ticket-image' },
    ],
  });

  return { sent: true, skipped: false };
}

// ── Schema ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(event_id) REFERENCES events(id)
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

addColumnIfMissing('events', 'capacity', 'INTEGER DEFAULT 0');
addColumnIfMissing('events', 'general_price', 'REAL');
addColumnIfMissing('events', 'early_price', 'REAL');
addColumnIfMissing('events', 'vip_price', 'REAL');
addColumnIfMissing('tickets', 'ticket_type', "TEXT DEFAULT 'general'");
addColumnIfMissing('tickets', 'price_paid', 'REAL DEFAULT 0');
addColumnIfMissing('banners', 'start_at', 'TEXT');
addColumnIfMissing('banners', 'end_at', 'TEXT');
addColumnIfMissing('banners', 'priority', 'INTEGER DEFAULT 0');
addColumnIfMissing('banners', 'sort_order', 'INTEGER DEFAULT 0');

// Seed admin + defaults
const adminRow = db.prepare('SELECT count(*) as count FROM settings WHERE key = ?').get('admin_password') as any;
if (adminRow.count === 0) {
  const hashedPass = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'prismaadmin', 10);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_password', hashedPass);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('site_name', 'PRISMA PUB');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('hero_phrase', 'The Ultimate LGBT+ Experience');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('hero_subtitle', 'Music • Dance • Freedom');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('address', 'Kyiv, 14/3a Hetmana Str.');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('instagram_url', '');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('logo_url', '');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('footer_text', 'Your safe space for unforgettable nights. Music, love, and freedom.');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('marquee_1', 'PRISMA PUB • SAFE SPACE • GOOD VIBES • ');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('marquee_2', 'GALLERY • UNFORGETTABLE NIGHTS • ');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('show_hero_photos', '1');
}

ensureSettingDefault('smtp_enabled', '0');
ensureSettingDefault('smtp_host', '');
ensureSettingDefault('smtp_port', '587');
ensureSettingDefault('smtp_user', '');
ensureSettingDefault('smtp_pass', '');
ensureSettingDefault('smtp_secure', '0');
ensureSettingDefault('smtp_from_name', 'PRISMA PUB');
ensureSettingDefault('smtp_from_email', '');
ensureSettingDefault('site_font', 'amplitude');
ensureSettingDefault('hero_photo_left_url', '');
ensureSettingDefault('hero_photo_right_url', '');
ensureSettingDefault('instagram_posts', '');

// Seed events
const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
if (eventsCount.count === 0) {
  const ins = db.prepare('INSERT INTO events (title, date, time, description, price, image) VALUES (?, ?, ?, ?, ?, ?)');
  ins.run('PRISMA GRAND OPENING', '2024-06-01', '23:00', 'The biggest LGBT party in town. Join us for a night of music, dance, and freedom.', 15.00, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop');
  ins.run('NEON NIGHTS', '2024-06-15', '22:00', 'Glow in the dark party with the best DJs.', 20.00, 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2070&auto=format&fit=crop');
}

const logActivity = (action: string, details: string) => {
  try { db.prepare('INSERT INTO activity_logs (action, details) VALUES (?, ?)').run(action, details); } catch (err) { console.error("Log error:", err); }
};

// Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Auth middleware
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Unauthorized');
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, getJwtSigningSecret());
    next();
    return;
  } catch {}

  if (JWT_SECRET_PREVIOUS) {
    try {
      jwt.verify(token, JWT_SECRET_PREVIOUS);
      next();
      return;
    } catch {}
  }

  res.status(401).send('Invalid token');
};

const app = express();
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d',
  setHeaders: (res) => { res.setHeader('Cache-Control', 'public, max-age=2592000'); }
}));

// ── AUTH ─────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password') as { value: string } | undefined;
  if (row && bcrypt.compareSync(password, row.value)) {
    const token = jwt.sign({ admin: true }, getJwtSigningSecret(), { expiresIn: '24h' });
    logActivity('LOGIN', 'Admin logged in');
    res.json({ token });
  } else {
    res.status(401).send('Invalid password');
  }
});

// ── PUBLIC API ──────────────────────────────────────────
app.get('/api/settings', (_req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const publicKeys = new Set([
    'site_name', 'hero_phrase', 'hero_subtitle', 'address', 'instagram_url',
    'logo_url', 'footer_text', 'marquee_1', 'marquee_2', 'hero_image_url',
    'show_hero_photos', 'site_font', 'hero_photo_left_url', 'hero_photo_right_url', 'instagram_posts',
  ]);
  const obj = (settings as any[]).reduce((acc, curr) => {
    if (publicKeys.has(curr.key)) acc[curr.key] = curr.value;
    return acc;
  }, {} as any);
  res.json(obj);
});

app.get('/api/admin/settings', authenticate, (_req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all() as any[];
  const obj = settings.reduce((acc, curr) => {
    if (curr.key !== 'admin_password') acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
  res.json(obj);
});

app.get('/api/events', (_req, res) => {
  try {
    const events = db.prepare(`
      SELECT
        e.*,
        COALESCE((SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id), 0) as sold_count,
        CASE WHEN COALESCE(e.capacity, 0) > 0
          THEN MAX(0, e.capacity - COALESCE((SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id), 0))
          ELSE NULL
        END as remaining_count
      FROM events e
      WHERE e.is_active = 1
      ORDER BY e.date DESC
    `).all();
    res.json(events);
  } catch { res.status(500).json({ error: 'Failed to fetch events' }); }
});

app.get('/api/events/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch { res.status(500).json({ error: 'Failed to fetch event' }); }
});

app.post('/api/tickets', async (req, res) => {
  const { event_id, user_name, user_email, ticket_type } = req.body;
  if (!event_id || !user_name || !user_email) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const event = db.prepare('SELECT id, title, date, time, image, price, capacity, general_price, early_price, vip_price FROM events WHERE id = ? AND is_active = 1').get(event_id) as any;
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const soldCount = (db.prepare('SELECT COUNT(*) as count FROM tickets WHERE event_id = ?').get(event_id) as any)?.count || 0;
    if (event.capacity && soldCount >= Number(event.capacity)) {
      return res.status(400).json({ error: 'Aforo completo para este evento' });
    }

    const chosenType = ['general', 'early', 'vip'].includes(String(ticket_type || '').toLowerCase())
      ? String(ticket_type).toLowerCase()
      : 'general';
    const priceMap: Record<string, number> = {
      general: Number(event.general_price ?? event.price ?? 0),
      early: Number(event.early_price ?? event.general_price ?? event.price ?? 0),
      vip: Number(event.vip_price ?? event.general_price ?? event.price ?? 0),
    };
    const pricePaid = priceMap[chosenType];

    const qr_code = `PRISMA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const result = db.prepare('INSERT INTO tickets (event_id, user_name, user_email, qr_code, ticket_type, price_paid) VALUES (?, ?, ?, ?, ?, ?)')
      .run(event_id, user_name, user_email, qr_code, chosenType, pricePaid);
    logActivity('TICKET_PURCHASE', `${user_name} bought ${chosenType} ticket for event #${event_id}`);

    const emailPayload = {
      qr_code,
      user_name,
      user_email,
      event_title: event.title,
      event_date: event.date,
      event_time: event.time,
      ticket_type: chosenType,
      event_image: event.image,
    };

    try {
      const emailResult = await sendTicketEmail(req, emailPayload);
      if (emailResult.sent) {
        logActivity('TICKET_EMAIL_SENT', `Ticket ${qr_code} sent to ${user_email}`);
      } else if (emailResult.skipped) {
        logActivity('TICKET_EMAIL_SKIPPED', `SMTP disabled for ${user_email}`);
      }
      res.json({ id: result.lastInsertRowid, qr_code, ticket_type: chosenType, price_paid: pricePaid, email_sent: emailResult.sent, email_skipped: emailResult.skipped });
    } catch (mailErr: any) {
      logActivity('TICKET_EMAIL_FAILED', `Ticket ${qr_code} email failed: ${mailErr?.message || 'unknown error'}`);
      res.json({ id: result.lastInsertRowid, qr_code, ticket_type: chosenType, price_paid: pricePaid, email_sent: false, email_error: mailErr?.message || 'Email failed' });
    }
  } catch { res.status(500).json({ error: 'Failed to create ticket' }); }
});

app.get('/api/tickets/:qr_code', (req, res) => {
  try {
    const ticket = db.prepare(`
      SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time, e.image as event_image
      FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.qr_code = ?
    `).get(req.params.qr_code);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch { res.status(500).json({ error: 'Failed to fetch ticket' }); }
});

app.get('/api/tickets/:qr_code/image', async (req, res) => {
  try {
    const ticket = db.prepare(`
      SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time, e.image as event_image
      FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.qr_code = ?
    `).get(req.params.qr_code) as any;
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const imageBuffer = await buildTicketImageBuffer({
      qr_code: ticket.qr_code,
      user_name: ticket.user_name,
      event_title: ticket.event_title,
      event_date: ticket.event_date,
      event_time: ticket.event_time,
      ticket_type: ticket.ticket_type,
      event_image: ticket.event_image,
    });

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="entrada-${ticket.qr_code}.png"`,
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(imageBuffer);
  } catch (err) {
    console.error('Ticket image generation error:', err);
    res.status(500).json({ error: 'Failed to generate ticket image' });
  }
});

app.get('/api/gallery', (_req, res) => {
  res.json(db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC').all());
});

app.get('/api/banners', (_req, res) => {
  res.json(db.prepare(`
    SELECT *
    FROM banners
    WHERE active = 1
      AND (start_at IS NULL OR start_at = '' OR datetime(start_at) <= datetime('now'))
      AND (end_at IS NULL OR end_at = '' OR datetime(end_at) >= datetime('now'))
    ORDER BY priority DESC, sort_order ASC, created_at DESC
  `).all());
});

// ── ADMIN API ───────────────────────────────────────────
// Events
app.get('/api/admin/events', authenticate, (_req, res) => {
  res.json(db.prepare(`
    SELECT
      e.*,
      COALESCE((SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id), 0) as sold_count,
      CASE WHEN COALESCE(e.capacity, 0) > 0
        THEN MAX(0, e.capacity - COALESCE((SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id), 0))
        ELSE NULL
      END as remaining_count
    FROM events e
    ORDER BY e.date DESC
  `).all());
});

app.post('/api/admin/events', authenticate, (req, res) => {
  const { title, date, time, description, price, image, capacity, general_price, early_price, vip_price } = req.body;
  try {
    const result = db.prepare('INSERT INTO events (title, date, time, description, price, image, capacity, general_price, early_price, vip_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(title, date, time, description, price, image, capacity || 0, general_price ?? price, early_price ?? null, vip_price ?? null);
    logActivity('EVENT_CREATE', `Created: ${title}`);
    res.json({ id: result.lastInsertRowid });
  } catch { res.status(500).json({ error: 'Failed to create event' }); }
});

app.post('/api/admin/events/image', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image' });
  try {
    const filename = `event-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    await sharp(req.file.buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(path.join(uploadsDir, filename));
    const url = `/uploads/${filename}`;
    logActivity('EVENT_IMAGE', `Uploaded event image: ${url}`);
    res.json({ url });
  } catch {
    res.status(500).json({ error: 'Failed to upload event image' });
  }
});

app.patch('/api/admin/events/:id', authenticate, (req, res) => {
  const { title, date, time, description, price, image, is_active, capacity, general_price, early_price, vip_price } = req.body;
  try {
    db.prepare('UPDATE events SET title=?, date=?, time=?, description=?, price=?, image=?, is_active=?, capacity=?, general_price=?, early_price=?, vip_price=? WHERE id=?')
      .run(title, date, time, description, price, image, is_active !== undefined ? is_active : 1, capacity || 0, general_price ?? price, early_price ?? null, vip_price ?? null, req.params.id);
    logActivity('EVENT_UPDATE', `Updated: ${title}`);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to update event' }); }
});

app.delete('/api/admin/events/:id', authenticate, (req, res) => {
  try {
    const ev = db.prepare('SELECT title FROM events WHERE id = ?').get(req.params.id) as any;
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    db.prepare('DELETE FROM tickets WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    logActivity('EVENT_DELETE', `Deleted: ${ev.title}`);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete event' }); }
});

// Tickets
app.get('/api/admin/tickets', authenticate, (_req, res) => {
  res.json(db.prepare('SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time FROM tickets t JOIN events e ON t.event_id = e.id ORDER BY t.created_at DESC').all());
});

app.delete('/api/admin/tickets/:id', authenticate, (req, res) => {
  try {
    const ticket = db.prepare('SELECT user_name, user_email, qr_code FROM tickets WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);
    logActivity('TICKET_DELETE', `Deleted ticket ${ticket?.qr_code || req.params.id} for ${ticket?.user_email || 'unknown user'}`);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

app.post('/api/admin/tickets/:id/resend', authenticate, async (req, res) => {
  try {
    const ticket = db.prepare(`
      SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time, e.image as event_image
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      WHERE t.id = ?
    `).get(req.params.id) as any;
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const result = await sendTicketEmail(req, {
      qr_code: ticket.qr_code,
      user_name: ticket.user_name,
      user_email: ticket.user_email,
      event_title: ticket.event_title,
      event_date: ticket.event_date,
      event_time: ticket.event_time,
      ticket_type: ticket.ticket_type,
      event_image: ticket.event_image,
    });

    if (result.sent) {
      logActivity('TICKET_RESEND', `Resent ticket ${ticket.qr_code} to ${ticket.user_email}`);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: result.reason || 'Email skipped' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to resend ticket' });
  }
});

// Gallery
app.post('/api/admin/gallery', authenticate, upload.array('photos', 20), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return res.status(400).send('No files');
  const results = [];
  for (const file of files) {
    const filename = `gallery-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const filepath = path.join(uploadsDir, filename);
    try {
      await sharp(file.buffer).webp({ quality: 80 }).toFile(filepath);
      const url = `/uploads/${filename}`;
      const info = db.prepare('INSERT INTO gallery (url, caption) VALUES (?, ?)').run(url, '');
      logActivity('IMAGE_UPLOAD', `Uploaded: ${url}`);
      results.push({ id: info.lastInsertRowid, url });
    } catch (err) { console.error("Sharp error:", err); }
  }
  res.json(results);
});

app.delete('/api/admin/gallery/:id', authenticate, (req, res) => {
  const item = db.prepare('SELECT url FROM gallery WHERE id = ?').get(req.params.id) as any;
  db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
  // Try to delete file
  if (item?.url) {
    const fp = path.join(__dirname, item.url);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  logActivity('IMAGE_DELETE', `Deleted: ${item?.url}`);
  res.json({ success: true });
});

app.post('/api/admin/gallery/reorder', authenticate, (req, res) => {
  const { itemIds } = req.body;
  const stmt = db.prepare('UPDATE gallery SET sort_order = ? WHERE id = ?');
  const tx = db.transaction((ids: number[]) => { ids.forEach((id, i) => stmt.run(i, id)); });
  tx(itemIds);
  res.json({ success: true });
});

// Banners
app.get('/api/admin/banners', authenticate, (_req, res) => {
  res.json(db.prepare('SELECT * FROM banners ORDER BY priority DESC, sort_order ASC, created_at DESC').all());
});

app.post('/api/admin/banners', authenticate, (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  const startAt = String(req.body?.start_at ?? '').trim();
  const endAt = String(req.body?.end_at ?? '').trim();
  const priority = Number(req.body?.priority ?? 0) || 0;
  if (!text) return res.status(400).json({ error: 'Banner text is required' });
  try {
    const info = db.prepare('INSERT INTO banners (text, start_at, end_at, priority) VALUES (?, ?, ?, ?)')
      .run(text, startAt || null, endAt || null, priority);
    logActivity('BANNER_CREATE', `Banner: ${text}`);
    res.json({ id: info.lastInsertRowid });
  } catch {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

app.put('/api/admin/banners/:id', authenticate, (req, res) => {
  const { active, text, start_at, end_at, priority } = req.body;
  if (text !== undefined) {
    db.prepare('UPDATE banners SET text = ?, active = ?, start_at = ?, end_at = ?, priority = ? WHERE id = ?')
      .run(text, active ?? 1, start_at || null, end_at || null, Number(priority ?? 0) || 0, req.params.id);
  } else {
    db.prepare('UPDATE banners SET active = ? WHERE id = ?').run(active, req.params.id);
  }
  res.json({ success: true });
});

app.post('/api/admin/banners/reorder', authenticate, (req, res) => {
  const { itemIds } = req.body;
  if (!Array.isArray(itemIds)) return res.status(400).json({ error: 'itemIds array required' });
  const stmt = db.prepare('UPDATE banners SET sort_order = ? WHERE id = ?');
  const tx = db.transaction((ids: number[]) => { ids.forEach((id, i) => stmt.run(i, id)); });
  tx(itemIds);
  res.json({ success: true });
});

app.delete('/api/admin/banners/:id', authenticate, (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
  logActivity('BANNER_DELETE', `Deleted banner #${req.params.id}`);
  res.json({ success: true });
});

// Settings
app.post('/api/admin/settings', authenticate, (req, res) => {
  const updates = req.body;
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  if (updates.admin_password) {
    updates.admin_password = bcrypt.hashSync(updates.admin_password, 10);
  }
  const tx = db.transaction((data: Record<string, string>) => {
    for (const [key, value] of Object.entries(data)) { upsert.run(key, value); }
  });
  tx(updates);
  logActivity('SETTINGS_UPDATE', 'Settings updated');
  res.json({ success: true });
});

app.post('/api/admin/settings/hero-image', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image' });
  const filename = `hero-${Date.now()}.webp`;
  await sharp(req.file.buffer).webp({ quality: 85 }).toFile(path.join(uploadsDir, filename));
  const url = `/uploads/${filename}`;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('hero_image_url', url);
  logActivity('HERO_IMAGE', 'Hero image updated');
  res.json({ url });
});

app.post('/api/admin/settings/logo', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image' });
  const filename = `logo-${Date.now()}.webp`;
  await sharp(req.file.buffer).webp({ quality: 90 }).resize(400).toFile(path.join(uploadsDir, filename));
  const url = `/uploads/${filename}`;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('logo_url', url);
  logActivity('LOGO_UPDATE', 'Logo updated');
  res.json({ url });
});

app.post('/api/admin/settings/hero-photo-left', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image' });
  const filename = `hero-left-${Date.now()}.webp`;
  await sharp(req.file.buffer).webp({ quality: 86 }).resize({ width: 1200, withoutEnlargement: true }).toFile(path.join(uploadsDir, filename));
  const url = `/uploads/${filename}`;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('hero_photo_left_url', url);
  logActivity('HERO_LEFT_IMAGE', 'Hero left photo updated');
  res.json({ url });
});

app.post('/api/admin/settings/hero-photo-right', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image' });
  const filename = `hero-right-${Date.now()}.webp`;
  await sharp(req.file.buffer).webp({ quality: 86 }).resize({ width: 1200, withoutEnlargement: true }).toFile(path.join(uploadsDir, filename));
  const url = `/uploads/${filename}`;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('hero_photo_right_url', url);
  logActivity('HERO_RIGHT_IMAGE', 'Hero right photo updated');
  res.json({ url });
});

// Activity
app.get('/api/admin/activity', authenticate, (_req, res) => {
  res.json(db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50').all());
});

// Stats
app.get('/api/admin/stats', authenticate, (_req, res) => {
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events WHERE is_active = 1').get() as any;
  const totalTickets = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as any;
  const totalPhotos = db.prepare('SELECT COUNT(*) as count FROM gallery').get() as any;
  const dailyTickets = db.prepare('SELECT date(created_at) as date, COUNT(*) as count FROM tickets GROUP BY date(created_at) ORDER BY date DESC LIMIT 14').all();
  const ticketsPerEvent = db.prepare('SELECT e.title, COUNT(t.id) as ticket_count FROM events e LEFT JOIN tickets t ON e.id = t.event_id GROUP BY e.id ORDER BY ticket_count DESC LIMIT 10').all();
  res.json({ totalEvents: totalEvents.count, totalTickets: totalTickets.count, totalPhotos: totalPhotos.count, dailyTickets, ticketsPerEvent });
});

// ── Vite / Static ───────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => { console.log(`Prisma Pub running on http://localhost:${PORT}`); });
}

startServer();
