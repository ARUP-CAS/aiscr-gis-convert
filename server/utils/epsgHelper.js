// V souboru epsgHelper.js

const fs = require('fs').promises;
const config = require('../config');

const S_JTSK_BOUNDS = {
    minX: -900000, maxX: -400000,
    minY: -1300000, maxY: -900000
};

const WGS84_BOUNDS = {
    minX: -180, maxX: 180,
    minY: -90, maxY: 90
};

async function getEPSG(filePath, entities = null) {
    const fileExtension = filePath.split('.').pop().toLowerCase();

    if (fileExtension === 'shp') {
        return getEPSGForSHP(filePath);
    } else if (fileExtension === 'dxf') {
        return getEPSGForDXF(entities);
    } else {
        console.warn('Nepodporovaný typ souboru pro určení EPSG.');
        return null;
    }
}

async function getEPSGForSHP(shpPath) {
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
        console.warn('PRJ soubor nebyl nalezen nebo nelze přečíst. EPSG kód nebyl určen.');
    }

    return epsg;
}

function getEPSGForDXF(entities) {
    if (!entities || entities.length === 0) {
        console.warn('Nedostatek dat pro určení EPSG kódu');
        return null;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Výpočet extentu
    entities.forEach(entity => {
        if (entity.vertices) {
            entity.vertices.forEach(vertex => {
                minX = Math.min(minX, vertex.x);
                maxX = Math.max(maxX, vertex.x);
                minY = Math.min(minY, vertex.y);
                maxY = Math.max(maxY, vertex.y);
            });
        }
    });

    // Kontrola, zda souřadnice spadají do rozsahu S-JTSK
    if (minX >= S_JTSK_BOUNDS.minX && maxX <= S_JTSK_BOUNDS.maxX &&
        minY >= S_JTSK_BOUNDS.minY && maxY <= S_JTSK_BOUNDS.maxY) {
        console.log(`Určen EPSG kód: ${config.EPSG_CODES.S_JTSK} (automaticky dle rozsahu souřadnic)`);
        return config.EPSG_CODES.S_JTSK;
    }

    // Kontrola, zda souřadnice spadají do rozsahu WGS84
    if (minX >= WGS84_BOUNDS.minX && maxX <= WGS84_BOUNDS.maxX &&
        minY >= WGS84_BOUNDS.minY && maxY <= WGS84_BOUNDS.maxY) {
        console.log(`Určen EPSG kód: ${config.EPSG_CODES.WGS_84} (automaticky dle rozsahu souřadnic)`);
        return config.EPSG_CODES.WGS_84;
    }

    console.warn('Nelze automaticky určit EPSG kód dle rozsahu souřadnic');
    return null;
}

module.exports = { getEPSG };