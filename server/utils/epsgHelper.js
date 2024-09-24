const fs = require('fs').promises;
const config = require('../config');
const prj2epsg = require('prj2epsg');
const epsgIndex = require('epsg-index/all.json');

// Definice hranic pro S-JTSK a WGS84
const S_JTSK_BOUNDS = {
    minX: -900000, maxX: -400000,
    minY: -1300000, maxY: -900000
};

const WGS84_BOUNDS = {
    minX: -180, maxX: 180,
    minY: -90, maxY: 90
};

// Seznam variant S-JTSK kódů a jejich hledaných textů v PRJ
const S_JTSK_VARIANTS = [
    { epsg: 2065, searchText: 'S-JTSK_Ferro_Krovak' },
    { epsg: 5221, searchText: 'S-JTSK_Ferro_Krovak_East_North' },
    { epsg: 8352, searchText: 'S-JTSK_JTSK03_Krovak' },
    { epsg: 8353, searchText: 'S-JTSK_JTSK03_Krovak_East_North' },
    { epsg: 5513, searchText: 'S-JTSK_Krovak' },
    { epsg: 5514, searchText: 'S-JTSK_Krovak_East_North' },
    { epsg: 102066, searchText: 'S-JTSK_Ferro_Krovak_East_North' },
    { epsg: 102065, searchText: 'S-JTSK_Krovak' },
    { epsg: 102067, searchText: 'S-JTSK_Krovak_East_North' }
];

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
        // Načtení obsahu PRJ souboru
        const prjContent = await fs.readFile(prjPath, 'utf8');

        // Získání EPSG kódu pomocí prj2epsg
        const epsgCode = prj2epsg.fromPRJ(prjContent);

        if( typeof epsgCode === 'undefined' || epsgCode === null ) {
            // Záložní řešení: získání epsg z vyhledání stringu v prj souboru
            const prjString = prjContent.toLowerCase();
            const sJTSKVariant = S_JTSK_VARIANTS.find(variant => prjString.includes(variant.searchText.toLowerCase()));
            if (sJTSKVariant) {
                console.log(`\tEPSG určen pomocí vyhledávání proj4 stringu (${sJTSKVariant.epsg})`);
                const epsgInfo = sJTSKVariant.epsg;
                const name = sJTSKVariant.searchText ? epsgInfo.searchText : 'Název neznámý';

                epsg = {
                    code: epsgInfo,
                    name: name
                };

                return epsg;
            }
        }

        if (epsgCode && epsgCode !== "undefined") {
            
            // Získání názvu systému z epsg-index podle kódu
            const epsgInfo = epsgIndex[epsgCode];
            const name = epsgInfo ? epsgInfo.name : 'Název neznámý';

            epsg = {
                code: epsgCode,
                name: name
            };

            return epsg;
        } else {
            console.warn('Odpovídající EPSG kód nebyl nalezen.');
        }

    } catch (error) {
        console.warn('PRJ soubor nebyl nalezen nebo nelze přečíst. EPSG kód nebyl určen.');
    }

    return null;
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
