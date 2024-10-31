const shapefile = require('shapefile');
const TerraformerWKT = require('terraformer-wkt-parser');
const fs = require('fs').promises;
const { decodeDBF } = require('./dbfDecoder');
const { getEPSG } = require('../utils/epsgHelper');
const config = require('../config');
const projConfig = require('../utils/projConfig');
const reprojectionHelper = require('../utils/reprojectionHelper');


async function convertShapefileToGeoJSON(shpPath) {
    const sanitizedShpPath = shpPath.replace(/\n|\r/g, "");
    console.log(`Zpracování SHP: ${sanitizedShpPath}`);
    try {
        const source = await shapefile.open(shpPath);

        const features = [];

        // Determine encoding
        const cpgPath = shpPath.replace('.shp', '.cpg');
        let encoding = config.DEFAULT_ENCODING;
        try {
            const cpgContent = await fs.readFile(cpgPath, 'utf8');
            encoding = cpgContent.trim();
            console.log(`\tKódování z CPG souboru: ${encoding}`);
        } catch (error) {
            console.warn('\tNebyl nalezen soubor.cpg, bude použito výchozí kodování:', encoding);
        }

        // Process DBF
        const dbfPath = shpPath.replace('.shp', '.dbf');
        const { fields, records } = await decodeDBF(dbfPath, encoding);
        console.log(`\tpočet záznamů: ${records.length}`);

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

        const attributes = fields.map(field => field.name);
        console.log(`\tnázvy atributů: ${attributes.join(', ')}`);

        // Přidání systémového ID do attributes a úprava hodnot v properties
        features.forEach((feature, index) => {
            const systemoveID = `Prvek_${index + 1}`;
            feature.properties['vygenerovaneID'] = systemoveID;  // Přidání systemoveID do properties

            // Projdeme všechny atributy a nahradíme prázdné hodnoty systémovým ID a převedeme na string
            attributes.forEach(attr => {
                let value = feature.properties[attr];

                // Podmínka pro nahrazení pouze prázdných nebo neplatných hodnot
                if (value === null || value === undefined || value === '' || Number.isNaN(value)) {
                    value = systemoveID;  // Nahrazení prázdných hodnot systémovým ID
                }

                // Převedení všech hodnot na string
                feature.properties[attr] = String(value);
            });

        });

        attributes.unshift('vygenerovaneID');  // Přidání vygenerovaneID na začátek seznamu atributů
        
        // Získání EPSG kódu
        let epsg = null;

        const epsgData = await getEPSG(shpPath); // epsgData nebo null

        if (epsgData && epsgData.code) {
            epsg = epsgData.code;
            console.log(`\tEPSG: ${epsg}`);
        }

        // Reprojekce souřadnic, pokud není EPSG 5514
        let reprojected = false;
        let originalEPSG = epsg;
        let currentEPSG = epsg;

        // Pokud je EPSG 5514 nebo 4326, není potřeba reprojekce, return
        if (epsg === 5514 || epsg === 4326) {
            console.log(`\tReprojekce není potřeba. Data zůstávají v původním EPSG (${epsg}.`);
            return { features: features, attributes, originalEPSG, currentEPSG, reprojected };
        }

        // Kontrola, zda je EPSG v seznamu možných variant Křováka
        const isKnownKrovakEPSG = projConfig.some(def => def.code === `EPSG:${epsg}`);
        if (!isKnownKrovakEPSG) {
            console.warn(`\tReprojekce neproběhne, EPSG ${epsg} není v seznamu známých variant Křováka.`);
            return { features: features, attributes, originalEPSG, currentEPSG, reprojected };
        }

        // Reprojekce
        console.log(`\tReprojekce do EPSG 5514`);
        currentEPSG = 5514;
        const reprojectedFeatures = await reprojectionHelper.reprojectFeaturesTo5514(features, epsg);
        reprojected = true;
        return { features: reprojectedFeatures, attributes, originalEPSG, currentEPSG, reprojected };

    } catch (error) {
        console.error(`Došlo k chybě při zpracování ${sanitizedShpPath}:`, error);
        throw error;
    }
}


function convertGeoJSONToWKT(geojson) {
    console.log(`\tPřevod záznamů (${geojson.length}) do WKT`);
    try {
        return geojson.map(feature => TerraformerWKT.convert(feature.geometry));
    } catch (error) {
        console.error('Error converting GeoJSON to WKT:', error);
        throw error;
    }
}

module.exports = { convertShapefileToGeoJSON, convertGeoJSONToWKT };