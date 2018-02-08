const iconv = require('iconv-lite');
const ContentType = require('content-type');

module.exports = (req, res, next) => {
    let chunks = [];
    req.on('data', (chunk) => { 
        chunks.push(chunk);
    });
    req.on('end', () => {
        try {
            let charset = 'UTF-8';
            if(req.headers['content-type']) {
                let contentType = ContentType.parse(req.headers['content-type']);
                if(contentType.parameters.charset) charset = contentType.parameters.charset;
            }
            let body = iconv.decode(Buffer.concat(chunks), charset);
            try {req.body = JSON.parse(body)}
            catch(err) {throw new Error(`invalid body: ${body}`)}
            next();
        }
        catch(err) {
            next(new Error(`invalid request: ${err.message}`));
        }
    });
};