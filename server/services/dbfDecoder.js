const { DBFFile } = require('dbffile');
const { decodeText } = require('../utils/textDecoder');
const config = require('../config');

async function decodeDBF(dbfPath, encoding = config.DEFAULT_ENCODING) {
    try {
        const dbf = await DBFFile.open(dbfPath, { 
            encoding: encoding,
            readMode: 'loose'
        });

        const fields = dbf.fields.map(field => ({
            ...field,
            name: decodeText(field.name, encoding)
        }));

        const records = [];
        for await (const record of dbf) {
            const decodedRecord = {};
            for (const [key, value] of Object.entries(record)) {
                const decodedKey = decodeText(key, encoding);
                decodedRecord[decodedKey] = typeof value === 'string' 
                    ? decodeText(value, encoding) 
                    : value;
            }
            records.push(decodedRecord);
        }

        return { fields, records };
    } catch (error) {
        console.error(`Error decoding DBF file: ${error.message}`);
        throw error;
    }
}

module.exports = { decodeDBF };