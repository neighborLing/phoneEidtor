const fs = require('fs');

const filePath = './index.html';

fs.readFile(filePath, 'utf-8', (err, text) => {
    if (err) throw err;

    const regex = /href=['"](.*?)['"]/g;
    const hrefs = [];

    let match;
    while ((match = regex.exec(text))) {
        hrefs.push(match[1]);
    }
});


