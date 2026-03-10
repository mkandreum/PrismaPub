import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'prisma.db'));

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    is_active BOOLEAN DEFAULT 1
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
`);

// Insert some default events if empty
const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
if (eventsCount.count === 0) {
  const insertEvent = db.prepare(`
    INSERT INTO events (title, date, time, description, price, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertEvent.run(
    'PRISMA GRAND OPENING',
    '2024-06-01',
    '23:00',
    'The biggest LGBT party in town. Join us for a night of music, dance, and freedom.',
    15.00,
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop'
  );
  insertEvent.run(
    'NEON NIGHTS',
    '2024-06-15',
    '22:00',
    'Glow in the dark party with the best DJs.',
    20.00,
    'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2070&auto=format&fit=crop'
  );
}

const app = express();
app.use(express.json());

// API Routes
app.get('/api/events', (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events WHERE is_active = 1 ORDER BY date ASC').all();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

app.post('/api/tickets', (req, res) => {
  const { event_id, user_name, user_email } = req.body;
  if (!event_id || !user_name || !user_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const qr_code = `PRISMA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const result = db.prepare(`
      INSERT INTO tickets (event_id, user_name, user_email, qr_code)
      VALUES (?, ?, ?, ?)
    `).run(event_id, user_name, user_email, qr_code);
    
    res.json({ id: result.lastInsertRowid, qr_code });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.get('/api/tickets/:qr_code', (req, res) => {
  try {
    const ticket = db.prepare(`
      SELECT t.*, e.title as event_title, e.date as event_date, e.time as event_time, e.image as event_image
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      WHERE t.qr_code = ?
    `).get(req.params.qr_code);
    
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Admin routes (No auth for now, just for demo)
app.get('/api/admin/events', (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY date DESC').all();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/admin/events', (req, res) => {
  const { title, date, time, description, price, image } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO events (title, date, time, description, price, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, date, time, description, price, image);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.delete('/api/admin/events/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.get('/api/admin/tickets', (req, res) => {
  try {
    const tickets = db.prepare(`
      SELECT t.*, e.title as event_title 
      FROM tickets t 
      JOIN events e ON t.event_id = e.id 
      ORDER BY t.created_at DESC
    `).all();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
