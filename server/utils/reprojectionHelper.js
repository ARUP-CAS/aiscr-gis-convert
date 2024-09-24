const proj4 = require('proj4');
const projDefinitions = require('./projConfig'); // Import definic z konfigurace
const { config, coordinates } = require('@maptiler/client'); // Import MapTiler API klienta
const {APIKEY_MAPTILER} = require('../config');

// Nastavení MapTiler API klíče
config.apiKey = APIKEY_MAPTILER;

// Registrace všech definic z konfiguračního souboru do proj4 (pro případné další použití)
projDefinitions.forEach(def => {
    proj4.defs(def.code, def.projString);
});

const reprojectionHelper = {
    reprojectFeaturesTo5514: async (features, originalEPSG) => {
        console.log('--- Reprojekce na 5514 ---');
        try {
            // Kontrola, zda je původní EPSG definován v proj4
            if (!proj4.defs(`EPSG:${originalEPSG}`)) {
                throw new Error(`EPSG ${originalEPSG} není podporován.`);
            }

            const reprojectedFeatures = await Promise.all(features.map(async (feature, index) => {
                let reprojectedGeometry;

                // Funkce pro transformaci bodu
                const transformPoint = async (coordinate) => {
                    const [x, y] = coordinate;
                    if (x === undefined || y === undefined) {
                        console.error('Chyba: Nedefinované souřadnice', coordinate);
                        return null;
                    }

                    try {
                        const transformedPoint = await coordinates.transform(
                            [x, y],
                            { sourceCrs: originalEPSG, targetCrs: 5514 }
                        );
                        const { x: transX, y: transY } = transformedPoint.results[0];
                        //console.log(`Transformace bodu (${x}, ${y}) na (${transX}, ${transY})`);
                        return [transX, transY];
                    } catch (error) {
                        console.error('Chyba při transformaci souřadnice:', error);
                        return null;
                    }
                };

                // Detekce typu geometrie a provedení reprojekce
                switch (feature.geometry.type) {
                    case "Point":
                        console.log('--- Reprojektujeme Point');
                        reprojectedGeometry = await transformPoint(feature.geometry.coordinates);
                        break;

                    case "LineString":
                    case "MultiPoint":
                        console.log('--- Reprojektujeme LineString nebo MultiPoint');
                        reprojectedGeometry = await Promise.all(feature.geometry.coordinates.map(transformPoint));
                        break;

                    case "Polygon":
                    case "MultiLineString":
                        console.log('--- Reprojektujeme Polygon nebo MultiLineString');
                        reprojectedGeometry = await Promise.all(
                            feature.geometry.coordinates.map(async ring => {
                                return await Promise.all(ring.map(transformPoint));
                            })
                        );
                        break;

                    case "MultiPolygon":
                        console.log('--- Reprojektujeme MultiPolygon');
                        reprojectedGeometry = await Promise.all(
                            feature.geometry.coordinates.map(async polygon => {
                                return await Promise.all(
                                    polygon.map(async ring => {
                                        return await Promise.all(ring.map(transformPoint));
                                    })
                                );
                            })
                        );
                        break;

                    default:
                        throw new Error(`Nepodporovaný typ geometrie: ${feature.geometry.type}`);
                }

                // Vytvoření nové feature s reprojektovanou geometrií
                const newFeature = {
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: reprojectedGeometry
                    }
                };
 
                return newFeature;
            }));

            return reprojectedFeatures;
        } catch (error) {
            console.error(`Chyba při reprojekci: ${error.message}`);
            return null;
        }
    }
};

module.exports = reprojectionHelper;
