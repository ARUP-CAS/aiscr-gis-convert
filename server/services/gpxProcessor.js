const fs = require('fs').promises;
const { parseStringPromise } = require('xml2js');
const TerraformerWKT = require('terraformer-wkt-parser');

/**
 * Zpracuje GPX soubor a vrátí informace o prvcích.
 * @param {string} filePath Cesta k GPX souboru.
 * @returns {Promise<Object>} Výsledné prvky s geometrií a dalšími atributy.
 */
async function processGPX(filePath) {
    try {
        console.log(`Processing GPX file: ${filePath}`);

        // Načtení obsahu GPX souboru
        const gpxContent = await fs.readFile(filePath, 'utf-8');

        // Parsování GPX XML na JS objekt
        const gpxData = await parseStringPromise(gpxContent);

        const features = [];
        const elements = extractElements(gpxData);

        elements.forEach((element, index) => {
            const label = element.name || `Prvek_${index + 1}`;
            const geometryType = determineGeometryType(element.geometry);

            if (!geometryType) {
                console.warn(`Skipping element without valid geometry: ${label}`);
                return;
            }

            features.push({
                label,
                epsg: '4326', // Zatím pevně 4326. Budoucí testování EPSG podle rozsahu možné.
                geometry: convertToWKT(geometryType, element.geometry),
                geometryType: geometryType,
                systemoveID: `Prvek_${index}`  // Interní unikátní ID bez diakritiky
            });
        });

        return { features };
    } catch (error) {
        console.error(`Error processing GPX file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Extrahuje relevantní prvky z GPX objektu.
 * @param {Object} gpxData Parsed GPX data.
 * @returns {Array} Pole prvků s name a geometrií.
 */
function extractElements(gpxData) {
    const elements = [];

    // Zpracování waypointů (wpt)
    if (gpxData.gpx.wpt) {
        gpxData.gpx.wpt.forEach((wpt) => {
            elements.push({
                name: wpt.name ? wpt.name[0] : null,
                geometry: [[parseFloat(wpt.$.lon), parseFloat(wpt.$.lat)]],
            });
        });
    }

    // Zpracování tras (trk)
    if (gpxData.gpx.trk) {
        gpxData.gpx.trk.forEach((trk) => {
            const name = trk.name ? trk.name[0] : null;

            trk.trkseg.forEach((trkseg) => {
                const geometry = trkseg.trkpt.map((trkpt) => [
                    parseFloat(trkpt.$.lon),
                    parseFloat(trkpt.$.lat),
                ]);

                elements.push({ name, geometry });
            });
        });
    }

    // Zpracování rout (rte)
    if (gpxData.gpx.rte) {
        gpxData.gpx.rte.forEach((rte) => {
            const name = rte.name ? rte.name[0] : null;

            const geometry = rte.rtept.map((rtept) => [
                parseFloat(rtept.$.lon),
                parseFloat(rtept.$.lat),
            ]);

            elements.push({ name, geometry });
        });
    }

    return elements;
}

/**
 * Určí typ geometrie na základě bodů.
 * @param {Array} points Pole souřadnic.
 * @returns {string} Typ geometrie: POINT, LINESTRING, nebo POLYGON.
 */
function determineGeometryType(points) {
    if (!points || points.length === 0) return null;

    if (points.length === 1) {
        return 'POINT';
    } else if (points.length > 2 && isPolygon(points)) {
        return 'POLYGON';
    } else {
        return 'LINESTRING';
    }
}

/**
 * Ověří, zda body tvoří polygon (uzavřená geometrie).
 * @param {Array} points Pole souřadnic.
 * @returns {boolean} True, pokud tvoří polygon.
 */
function isPolygon(points) {
    const [firstLon, firstLat] = points[0];
    const [lastLon, lastLat] = points[points.length - 1];
    return firstLon === lastLon && firstLat === lastLat;
}

/**
 * Převede geometrii do WKT formátu.
 * @param {string} type Typ geometrie.
 * @param {Array} points Pole souřadnic.
 * @returns {string} Geometrie ve WKT formátu.
 */
function convertToWKT(type, points) {
    switch (type) {
        case 'POINT':
            return `POINT (${points[0][0]} ${points[0][1]})`;
        case 'LINESTRING':
            return `LINESTRING (${points.map(([lon, lat]) => `${lon} ${lat}`).join(', ')})`;
        case 'POLYGON':
            return `POLYGON ((${points.map(([lon, lat]) => `${lon} ${lat}`).join(', ')}))`;
        default:
            throw new Error(`Unsupported geometry type: ${type}`);
    }
}

module.exports = { processGPX };
