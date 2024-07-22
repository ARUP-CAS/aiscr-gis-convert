const fs = require('fs').promises;
const config = require('../config');

async function getEPSG(shpPath) {
    const prjPath = shpPath.replace('.shp', '.prj');
    let epsg = null;

    try {
        const prjContent = await fs.readFile(prjPath, 'utf8');

        if (prjContent.includes('S-JTSK') || prjContent.includes('Krovak')) {
            epsg = config.EPSG_CODES.S_JTSK;
        } else if (prjContent.includes('WGS 84') || prjContent.includes('WGS_1984')) {
            epsg = config.EPSG_CODES.WGS_84;
        }

        if (epsg) {
            console.log(`Určen EPSG kód: ${epsg}`);
        } else {
            console.warn('Nepodporovaný souřadnicový systém. Podporovány jsou pouze S-JTSK a WGS 84.');
        }

    } catch (error) {
        console.error('Chyba při čtení PRJ souboru:', error);
    }

    return epsg;
}

module.exports = { getEPSG };