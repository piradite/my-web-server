const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cheerio = require('cheerio');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret: 'ec3f349f8817fb801fc6bde5dfc0c0c47b09a51a177fded9d1039d657286c19b91bd05933ca9bc4b0cc754c035457c2aaf564df69b03a327976cf757d014203c', // Change this to a secure random key
  resave: false,
  saveUninitialized: true,
}));

const normalizeCode = code => code.toLowerCase().replace(/[^a-z0-9]/g, '');

const removeUnwantedElements = html => {
  const $ = cheerio.load(html);
  $('.ytp-chrome-top, .ytp-watermark').remove();
  return $.html();
};

const generateValidHtml = () => `
  <style>
    .body { margin: 0; padding: 0; overflow: hidden; }
    .input, .textarea { margin-bottom: 10px; width: calc(100% - 22px); padding: 10px; border: 2px solid white; background: black; color: white; box-sizing: border-box; resize: none; border-radius: 8px; }
    .button { padding: 8px 16px; border: 2px solid white; background: black; color: white; cursor: pointer; transition: 0.2s; text-transform: uppercase; border-radius: 8px; font-size: 14px; box-sizing: border-box; width: auto; max-width: 100%; }
    .button:hover { background: white; color: black; }
    .button:active { background: #111; color: white; }
    .centered-text { text-align: center; color: white; font-size: 16px; margin-bottom: 20px; }
    .input:-webkit-autofill, .textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px black inset; -webkit-text-fill-color: white; }
    .input:-moz-autofill, .textarea:-moz-autofill, .input:-ms-autofill, .textarea:-ms-autofill { background: black; color: white; }
    .input:invalid, .textarea:invalid { box-shadow: none; outline: none; }
    .form-container { background: black; padding: 20px; border-radius: 8px; }
  </style>
  <body class="body">
    <p class="centered-text">Write anything to be on my website! (SFW)</p>
    <div class="form-container">
      <form action="https://formsubmit.co/4d55ac8e91fc05d02ab1af48c62d1364" method="POST" novalidate class="form">
        <input type="text" name="name" required placeholder="Name" class="input">
        <textarea name="message" rows="2" required placeholder="Your Message" class="textarea"></textarea>
        <input type="hidden" name="_next" value="http://localhost:3000/">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_template" value="table">
        <input type="text" name="_honey" style="display:none">
        <button type="submit" class="button">Send</button>
      </form>
    </div>
  </body>
`;

// Track total and unique visitors
const totalVisitorsPath = path.join(__dirname, 'totalVisitors.json');
const uniqueVisitorsPath = path.join(__dirname, 'uniqueVisitors.json');

const getTotalVisitors = () => {
  if (!fs.existsSync(totalVisitorsPath)) return 0;
  const data = fs.readFileSync(totalVisitorsPath);
  return JSON.parse(data).count || 0;
};

const incrementTotalVisitors = () => {
  let count = getTotalVisitors();
  count += 1;
  fs.writeFileSync(totalVisitorsPath, JSON.stringify({ count }));
};

const getUniqueVisitors = () => {
  if (!fs.existsSync(uniqueVisitorsPath)) return [];
  const data = fs.readFileSync(uniqueVisitorsPath);
  return JSON.parse(data).visitors || [];
};

const addUniqueVisitor = (visitorId) => {
  const visitors = getUniqueVisitors();
  if (!visitors.includes(visitorId)) {
    visitors.push(visitorId);
    fs.writeFileSync(uniqueVisitorsPath, JSON.stringify({ visitors }));
  }
};

app.post('/', (req, res) => {
  const { code } = req.body;
  if (typeof code !== 'string') return res.status(400).json({ success: false, message: 'Invalid code format' });

  const normalizedCode = normalizeCode(code);
  const validCode = process.env.CODE;

  if (normalizedCode === validCode) {
    incrementTotalVisitors();

    // Track unique visitors
    const visitorId = req.cookies.visitorId || Math.random().toString(36).substr(2, 9);
    res.cookie('visitorId', visitorId, { maxAge: 1000 * 60 * 60 * 24 * 365 }); // Cookie lasts for a year
    addUniqueVisitor(visitorId);

    // Track current on-site users
    if (!req.session.visited) {
      req.session.visited = true;
      req.session.save();
    }

    setTimeout(() => res.status(200).send(removeUnwantedElements(generateValidHtml())), 100);
  } else {
    res.status(404).json({ success: false, message: 'Invalid code' });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Track current on-site users
const activeSessions = new Set();
app.use((req, res, next) => {
  if (req.session.visited) {
    activeSessions.add(req.session.id);
  } else {
    if (req.session.id) activeSessions.delete(req.session.id);
  }
  req.on('finish', () => {
    activeSessions.delete(req.session.id);
  });
  next();
});

app.get('/stats', (req, res) => {
  res.json({
    totalVisitors: getTotalVisitors(),
    uniqueVisitors: getUniqueVisitors().length,
    currentOnSite: activeSessions.size
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
