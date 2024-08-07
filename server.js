const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cheerio = require('cheerio');

dotenv.config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

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
      <form id="submission-form" action="https://formsubmit.co/4d55ac8e91fc05d02ab1af48c62d1364" method="POST" novalidate class="form">
        <input type="text" name="name" required placeholder="Name" class="input">
        <textarea name="message" rows="2" required placeholder="Your Message" class="textarea"></textarea>
        <input type="hidden" name="_next" value="http://localhost:3000/">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_template" value="table">
        <input type="text" name="_honey" style="display:none">
        <button type="submit" class="button">Send</button>
      </form>
    </div>
    <script>
      document.getElementById('submission-form').addEventListener('submit', function(event) {
        setTimeout(function() {
          document.querySelector('[data-fancybox-close]').click();
        }, 200);
      });
    </script>
  </body>
`;

app.post('/', (req, res) => {
  const { code } = req.body;
  if (typeof code !== 'string') return res.status(400).json({ success: false, message: 'Invalid code format' });

  const normalizedCode = normalizeCode(code);
  const validCode = process.env.CODE;

  if (normalizedCode === validCode) {
    const cleanedHtml = removeUnwantedElements(generateValidHtml());
    setTimeout(() => res.status(200).send(cleanedHtml), 100);
  } else {
    res.status(404).json({ success: false, message: 'Invalid code' });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
