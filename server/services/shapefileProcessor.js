const shapefile = require('shapefile');
const TerraformerWKT = require('terraformer-wkt-parser');
const fs = require('fs').promises;
const { decodeDBF } = require('./dbfDecoder');
const { getEPSG } = require('../utils/epsgHelper');
const config = require('../config');

async function convertShapefileToGeoJSON(shpPath) {
    console.log(`Starting conversion of shapefile: ${shpPath}`);
    try {
        const source = await shapefile.open(shpPath);
        console.log('Shapefile opened successfully');

        const features = [];

        // Determine encoding
        const cpgPath = shpPath.replace('.shp', '.cpg');
        let encoding = config.DEFAULT_ENCODING;
        try {
            const cpgContent = await fs.readFile(cpgPath, 'utf8');
            encoding = cpgContent.trim();
            console.log(`Using encoding from CPG file: ${encoding}`);
        } catch (error) {
            console.warn('No .cpg file found, using default encoding:', encoding);
        }

        // Process DBF
        const dbfPath = shpPath.replace('.shp', '.dbf');
        console.log(`Processing DBF file: ${dbfPath}`);
        const { fields, records } = await decodeDBF(dbfPath, encoding);
        console.log(`Processed ${records.length} records from DBF`);

        // Process features
        let result;
        let i = 0;
        while (!(result = await source.read()).done) {
            if (i >= records.length) {
                console.warn(`More features in SHP than records in DBF. Stopping at index ${i}`);
                break;
            }
            features.push({
                type: "Feature",
                geometry: result.value.geometry,
                properties: records[i]
            });
            i++;
        }
        console.log(`Processed ${features.length} features`);

        const epsg = await getEPSG(shpPath);
        console.log(`EPSG code: ${epsg}`);

        const attributes = fields.map(field => field.name);
        console.log(`Attributes: ${attributes.join(', ')}`);

        return { features, epsg, attributes };
    } catch (error) {
        console.error(`Error converting shapefile to GeoJSON for file ${shpPath}:`, error);
        throw error;
    }
}

function convertGeoJSONToWKT(geojson) {
    console.log(`Converting ${geojson.length} features to WKT`);
    try {
        return geojson.map(feature => TerraformerWKT.convert(feature.geometry));
    } catch (error) {
        console.error('Error converting GeoJSON to WKT:', error);
        throw error;
    }
}

module.exports = { convertShapefileToGeoJSON, convertGeoJSONToWKT };