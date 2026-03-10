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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'prisma-pub-jwt-secret-change-me';

// Ensure directories
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
[dataDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const db = new Database(path.join(dataDir, 'prisma.db'));

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
}

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
  try { jwt.verify(token, JWT_SECRET); next(); } catch { res.status(401).send('Invalid token'); }
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
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
    logActivity('LOGIN', 'Admin logged in');
    res.json({ token });
  } else {
    res.status(401).send('Invalid password');
  }
});

// ── PUBLIC API ──────────────────────────────────────────
app.get('/api/settings', (_req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const obj = (settings as any[]).reduce((acc, curr) => {
    if (curr.key !== 'admin_password') acc[curr.key] = curr.value;
    return acc;
  }, {} as any);
  res.json(obj);
});

app.get('/api/events', (_req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events WHERE is_active = 1 ORDER BY date ASC').all();
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

app.post('/api/tickets', (req, res) => {
  const { event_id, user_name, user_email } = req.body;
  if (!event_id || !user_name || !user_email) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const qr_code = `PRISMA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const result = db.prepare('INSERT INTO tickets (event_id, user_name, user_email, qr_code) VALUES (?, ?, ?, ?)').run(event_id, user_name, user_email, qr_code);
    logActivity('TICKET_PURCHASE', `${user_name} bought ticket for event #${event_id}`);
    res.json({ id: result.lastInsertRowid, qr_code });
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

app.get('/api/gallery', (_req, res) => {
  res.json(db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC').all());
});

app.get('/api/banners', (_req, res) => {
  res.json(db.prepare('SELECT * FROM banners WHERE active = 1').all());
});

// ── ADMIN API ───────────────────────────────────────────
// Events
app.get('/api/admin/events', authenticate, (_req, res) => {
  res.json(db.prepare('SELECT * FROM events ORDER BY date DESC').all());
});

app.post('/api/admin/events', authenticate, (req, res) => {
  const { title, date, time, description, price, image } = req.body;
  try {
    const result = db.prepare('INSERT INTO events (title, date, time, description, price, image) VALUES (?, ?, ?, ?, ?, ?)').run(title, date, time, description, price, image);
    logActivity('EVENT_CREATE', `Created: ${title}`);
    res.json({ id: result.lastInsertRowid });
  } catch { res.status(500).json({ error: 'Failed to create event' }); }
});

app.patch('/api/admin/events/:id', authenticate, (req, res) => {
  const { title, date, time, description, price, image, is_active } = req.body;
  try {
    db.prepare('UPDATE events SET title=?, date=?, time=?, description=?, price=?, image=?, is_active=? WHERE id=?')
      .run(title, date, time, description, price, image, is_active !== undefined ? is_active : 1, req.params.id);
    logActivity('EVENT_UPDATE', `Updated: ${title}`);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to update event' }); }
});

app.delete('/api/admin/events/:id', authenticate, (req, res) => {
  try {
    const ev = db.prepare('SELECT title FROM events WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    logActivity('EVENT_DELETE', `Deleted: ${ev?.title}`);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete event' }); }
});

// Tickets
app.get('/api/admin/tickets', authenticate, (_req, res) => {
  res.json(db.prepare('SELECT t.*, e.title as event_title FROM tickets t JOIN events e ON t.event_id = e.id ORDER BY t.created_at DESC').all());
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
  res.json(db.prepare('SELECT * FROM banners ORDER BY created_at DESC').all());
});

app.post('/api/admin/banners', authenticate, (req, res) => {
  const { text } = req.body;
  const info = db.prepare('INSERT INTO banners (text) VALUES (?)').run(text);
  logActivity('BANNER_CREATE', `Banner: ${text}`);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/admin/banners/:id', authenticate, (req, res) => {
  const { active, text } = req.body;
  if (text !== undefined) {
    db.prepare('UPDATE banners SET text = ?, active = ? WHERE id = ?').run(text, active ?? 1, req.params.id);
  } else {
    db.prepare('UPDATE banners SET active = ? WHERE id = ?').run(active, req.params.id);
  }
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
