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

const normalizeCode = (code) => {
  return code
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

const removeUnwantedElements = (html) => {
  const $ = cheerio.load(html);
  $('.ytp-chrome-top').remove(); // Remove ytp-chrome-top and its sub-elements
  $('.ytp-watermark').remove();  // Remove ytp-watermark and its sub-elements
  return $.html();
};

app.post('/', (req, res) => {
  const code = req.body.code;

  if (typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid code format' });
  }

  const normalizedCode = normalizeCode(code);

  const validCodes = {
    [process.env.CODE1]: `
      <body style="margin: 0; padding: 0; overflow: hidden;">
        <iframe 
          src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&enablejsapi=1" 
          allow="autoplay" 
          allowfullscreen 
          style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
        ></iframe>
      </body>
    `,
    [process.env.CODE2]: `
        <body style="margin: 0; padding: 0; overflow: hidden;">
        <iframe 
        src="https://www.youtube-nocookie.com/embed/de1L1iRIcqU?autoplay=1&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=de1L1iRIcqU&controls=0&enablejsapi=1" 
        allow="autoplay" 
        allowfullscreen 
        style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
        ></iframe>
    </body>
    `,
    [process.env.CODE3]: `
    <body style="margin: 0; padding: 0; overflow: hidden;">
    <iframe 
    src="https://www.youtube-nocookie.com/embed/XDMAO7sHMz0?autoplay=1&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=XDMAO7sHMz0&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
    </body>
    `,
    [process.env.CODE4]: `
    <body style="margin: 0; padding: 0; overflow: hidden;">
    <iframe 
    src="https://www.youtube-nocookie.com/embed/lpPwLKWcHX0?autoplay=1&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=lpPwLKWcHX0&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
    </body>
    `,
    [process.env.CODE5]: `
    <body style="margin: 0; padding: 0; overflow: hidden;">
    <iframe 
    src="https://www.youtube-nocookie.com/embed/ivqRdVAkdEw?autoplay=1&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=ivqRdVAkdEw&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
    </body>
    `,

    [process.env.CODE6]: `
      <div style="width: 25vw; height: 50vh; padding: 10px;">
        <img src="https://m.media-amazon.com/images/I/81O6JfipQhL._SL1500_.jpg" style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;">
        <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 30%;white-space: nowrap; position: absolute; color: #541D04">
HARDCOVER: -------
</p>
      </div>
    `,
    [process.env.CODE7]: `
    <body style="margin: 0; padding: 0; overflow: hidden;">
    <iframe 
    src="https://www.youtube-nocookie.com/embed/mscDaDd1ipk?autoplay=1&amp;start=8&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=mscDaDd1ipk&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
</body>
    `,
    [process.env.CODE8]: `
    <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 40%; position: absolute;white-space: nowrap; color: #541D04">
    You think the world makes sense? Nothing makes sense! So you might as well make nonsense, think about it!
  </p>
    `,
    [process.env.CODE9]: `
    <body style="margin: 0; padding: 0; overflow: hidden;">
    <iframe 
    src="https://www.youtube-nocookie.com/embed/62GQbwih6is?autoplay=1&amp;start=8&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=62GQbwih6is&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
</body>
    `,
    [process.env.CODE10]: `
    <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 40%; position: absolute; white-space: nowrap;color: #541D04">
    Ah, Vera Lynn, I love her voice, it hurts to say goodbye... the tempo...
  </p>
    `,
    [process.env.CODE11]: `
      <div style="width: 50vw; height: 50vh; padding: 10px;">
        <img src="https://media.discordapp.net/attachments/1104431544367579221/1269078318117032007/image.png?ex=66aec0c9&is=66ad6f49&hm=3541b49138a0e968144d040f93cffe83077c638b5849d60dc81bdc070353eb73&=&format=webp&quality=lossless&width=1027&height=660">
      </div>
    `,
    [process.env.CODE12]: `
    <body style="margin: 0; padding: 0; overflow: hidden;">
    <iframe 
    src="https://www.youtube-nocookie.com/embed/DdD0oPs-bQ4?autoplay=1&amp;start=8&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=DdD0oPs-bQ4&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
    <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 40%; position: absolute;white-space: nowrap; color: #541D04">
    Watch the piano
  </p>
</body>
    `,
    [process.env.CODE13]: `
    <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 40%; position: absolute;white-space: nowrap; color: #541D04">
    You'll have to think a little about this one △ 1:12
  </p>
    `,
    [process.env.CODE14]: `
    <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 40%; position: absolute;white-space: nowrap; color: #541D04">
    17th day of being in Gravity Falls. I hear some loud noise, it's very annoying, how was it called?
  </p>
    `,
    [process.env.CODE15]: `
    <body style="margin: 0; padding: 0; overflow: hidden;">
    <iframe 
    src="https://www.youtube-nocookie.com/embed/mAisA7XxiOM?autoplay=1&amp;start=8&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=mAisA7XxiOM&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
    <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center;white-space: nowrap; left: 0; right: 0; bottom: 40%; position: absolute;white-space: nowrap; color: #541D04">
    What was first?
  </p>
</body>
    `,
    [process.env.CODE16]: `
      <div style="width: 50vw; height: 50vh; padding: 10px;">
        <img src="https://i.pinimg.com/originals/f0/c6/f2/f0c6f2b8e0f4916d46d29252df558aef.jpg">
      </div>
    `,
    [process.env.CODE17]: `
    <p style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 0%; position: absolute;white-space: nowrap; color: #541D04">
    ah... the legends lost... (utvd vhoxk)
  </p>
    `,
    [process.env.CODE18]: `
    <iframe 
    src="https://www.youtube-nocookie.com/embed/H9Mfhy6I5gk?autoplay=1&amp;start=8&controls=0&showinfo=0&disablekb=1&fs=0&modestbranding=0&playsinline=1&loop=1&playlist=H9Mfhy6I5gk&controls=0&enablejsapi=1" 
    allow="autoplay" 
    allowfullscreen 
    style="width: 50vw; height: 50vh; border: none; display: block; margin: 0 auto; pointer-events: none;"
    ></iframe>
    `,
    [process.env.CODE19]: `
    <p style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 0%; position: absolute;white-space: nowrap; color: #541D04">
    WHICH ONE RELEASES THE TRAPDOOR
  </p>
    `,
    [process.env.CODE20]: `
    <p class="text-2xl md:text-4xl" style="font-family: 'Yesteryear', serif; text-align: center; left: 0; right: 0; bottom: 40%;white-space: nowrap; position: absolute; color: #541D04">
    Do you accept the deal?
    <br>
    <a href="https://www.youtube.com/watch?v=xOMANxVfuuw" style="display: block;white-space: nowrap; margin-top: 10px; color: #541D04;">Yes</a>
    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" style="display: block; white-space: nowrap;margin-top: 10px; color: #541D04;">No</a>
  </p>
  
    `,
    [process.env.CODE21]: `
    <div>
    <img src="https://media.discordapp.net/attachments/1268231029072597086/1269695562643406908/IMG_2952.png?ex=66b0ffa3&is=66afae23&hm=e7563a1638a2b5847ccbdaa2cd2c75799d3af508eebfc273ae7076e3335a52c6&=&format=webp&quality=lossless&width=771&height=660">
  </div>
`
  };

  if (validCodes[normalizedCode]) {
    const html = validCodes[normalizedCode];
    const cleanedHtml = removeUnwantedElements(html);
    res.status(200).send(cleanedHtml);
  } else {
    res.status(404).json({ success: false, message: 'Invalid code' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
