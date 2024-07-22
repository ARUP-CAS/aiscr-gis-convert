const iconv = require('iconv-lite');
const config = require('../config');

function decodeText(input, encoding = config.DEFAULT_ENCODING) {
    if (Buffer.isBuffer(input)) {
        return iconv.decode(input, encoding);
    } else if (typeof input === 'string') {
        const attempts = [
            () => input,
            () => iconv.decode(Buffer.from(input, 'binary'), encoding),
            () => iconv.decode(Buffer.from(input, 'utf-8'), 'cp1250'),
            () => iconv.decode(Buffer.from(input, 'binary'), 'cp1250'),
            () => iconv.decode(Buffer.from(input, 'utf-8'), 'iso-8859-2'),
            () => iconv.decode(Buffer.from(input, 'binary'), 'iso-8859-2')
        ];

        for (const attempt of attempts) {
            const result = attempt();
            if (/[ěščřžýáíé]/.test(result)) {
                return result;
            }
        }
    }
    return input;
}


module.exports = { decodeText };