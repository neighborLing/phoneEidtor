const https = require('https');

const url = 'http://cdn.repository.webfont.com/webfonts/nomal/151588/45817/6432363c6f50f6107075d37c.css';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(data);
    });
}).on('error', (err) => {
    console.error(err);
});
