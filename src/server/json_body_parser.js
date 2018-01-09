const iconv = require('iconv-lite');
const ContentType = require('content-type');

module.exports = (req, res, next) => {
    let chunks = [];
    req.on('data', (chunk) => { 
        chunks.push(chunk);
    });
    req.on('end', () => {
        try {
            let contentType = ContentType.parse(req.headers['content-type']);
            let charset = contentType.parameters.charset ? contentType.parameters.charset : 'UTF-8';
            let body = iconv.decode(Buffer.concat(chunks), charset);
            req.body = JSON.parse(body);
            next();
        }
        catch(err) {
            next(err);
        }
    });
};