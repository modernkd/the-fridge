import express from 'express';
import fs from 'fs';
import path from 'path';
import { db } from './src/db/index.js';
import { notes } from './src/db/schema.js';
import { getPendingNotes, getApprovedNotes, approveNote, rejectNote } from './src/db/auth.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.resolve('dist')));

// API Routes
app.post('/api/notes', async (req, res) => {
  try {
    const { name, email, title, message } = req.body;

    if (!name || !email || !title || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newNote = await db
      .insert(notes)
      .values({
        name,
        email,
        title,
        message,
        status: 'pending',
      })
      .returning();

    res.status(201).json({ success: true, note: newNote[0] });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes/approved', async (req, res) => {
  try {
    const approvedNotes = await getApprovedNotes();
    res.json(approvedNotes);
  } catch (error) {
    console.error('Error fetching approved notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Static meta tag injection for different pages
const pageMeta = {
  '/': {
    title: 'Home | kd davis',
    description:
      'A creative portfolio website built with React, TypeScript, and running with Vite. Includes a fun little fridge with some easter eggs and a real-time collaborative sound board',
    image: 'https://kd.works/home-screenshot.webp',
  },
  '/fridge': {
    title: 'Fridge | kd davis',
    description:
      "Interactive fridge-themed contact page with magnetic notes and contact form. Part of kd davis's creative portfolio website.",
    image: 'https://kd.works/fridge-screenshot.webp',
  },
  '/more-cowbell': {
    title: 'More Cowbell | kd davis',
    description:
      'Real-time collaborative emoji sound board app. Join a room and play sounds together with others in real-time using PartyKit.',
    image: 'https://kd.works/more-cowbell-screenshot.webp',
  },
};

function handleMetaPage(req, res, meta) {
  const template = fs.readFileSync(path.resolve('dist/index.html'), 'utf-8');

  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(
      '<!-- Open Graph / Facebook -->',
      `<!-- Open Graph / Facebook -->
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="https://kd.works${req.url}" />
    <meta property="og:image" content="${meta.image}" />`
    )
    .replace(
      '<!-- Twitter -->',
      `<!-- Twitter -->
    <meta property="twitter:title" content="${meta.title}" />
    <meta property="twitter:description" content="${meta.description}" />
    <meta property="twitter:image" content="${meta.image}" />`
    )
    .replace(
      /A creative portfolio website built with React, TypeScript, and running with Vite\. Includes a fun little fridge with some easter eggs and a real-time collaborative sound board/g,
      meta.description
    );

  res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
}

app.get('/', (req, res) => {
  handleMetaPage(req, res, pageMeta['/']);
});
app.get('/fridge', (req, res) => {
  handleMetaPage(req, res, pageMeta['/fridge']);
});
app.get('/more-cowbell', (req, res) => {
  handleMetaPage(req, res, pageMeta['/more-cowbell']);
});

// Handle room pages dynamically
app.get('/more-cowbell/room/:room', (req, res) => {
  const room = req.params.room;
  const meta = {
    title: `Room: ${room} | kd davis`,
    description:
      'Real-time collaborative emoji sound board. Play sounds together with others in this room using PartyKit.',
    image: 'https://kd.works/room-screenshot.webp',
  };
  handleMetaPage(req, res, meta);
});

// Handle admin page
app.get('/admin', (req, res) => {
  const meta = {
    title: 'Admin | kd davis',
    description: 'Admin panel for managing fridge notes',
    image: 'https://kd.works/fridge-screenshot.webp',
  };
  handleMetaPage(req, res, meta);
});

// Catch-all handler for client-side routing
app.use((req, res) => {
  const template = fs.readFileSync(path.resolve('dist/index.html'), 'utf-8');
  res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
});

app.listen(port, () => {
  console.log(`SSR server running on http://localhost:${port}`);
});
