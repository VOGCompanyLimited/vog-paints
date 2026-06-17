const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Busboy = require('busboy');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

router.post('/', protect, admin, (req, res) => {
  let found = false;
  const urls = [];
  const busboy = Busboy({ headers: req.headers });
  busboy.on('file', (fieldname, file, info) => {
    found = true;
    const ext = path.extname(info.filename || '.png');
    const filename = uuidv4() + ext;
    const ws = fs.createWriteStream(path.join(UPLOAD_DIR, filename));
    file.pipe(ws);
    urls.push(`/uploads/${filename}`);
  });
  busboy.on('finish', () => {
    if (!found || urls.length === 0) return res.status(400).json({ message: 'No files uploaded' });
    res.json({ urls });
  });
  busboy.on('error', () => res.status(500).json({ message: 'Upload failed' }));
  req.pipe(busboy);
});

router.post('/single', protect, admin, (req, res) => {
  let saved = null;
  const busboy = Busboy({ headers: req.headers });
  busboy.on('file', (fieldname, file, info) => {
    if (saved) return;
    const ext = path.extname(info.filename || '.png');
    const filename = uuidv4() + ext;
    const ws = fs.createWriteStream(path.join(UPLOAD_DIR, filename));
    file.pipe(ws);
    saved = `/uploads/${filename}`;
  });
  busboy.on('finish', () => {
    if (!saved) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: saved });
  });
  busboy.on('error', () => res.status(500).json({ message: 'Upload failed' }));
  req.pipe(busboy);
});

module.exports = router;
