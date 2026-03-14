const proj4 = require('proj4');
const projDefinitions = require('./projConfig');

// Registrace všech definic z konfiguračního souboru do proj4
projDefinitions.forEach(def => {
    proj4.defs(def.code, def.projString);
});

const transformPoint = (coordinate, fromEPSG) => {
    const [x, y] = coordinate;
    if (x === undefined || y === undefined) {
        console.error('Chyba: Nedefinované souřadnice', coordinate);
        return null;
    }
    return proj4(`EPSG:${fromEPSG}`, 'EPSG:5514', [x, y]);
};

const reprojectionHelper = {
    reprojectFeaturesTo5514: (features, originalEPSG) => {
        console.log('--- Reprojekce na 5514 ---');
        try {
            if (!proj4.defs(`EPSG:${originalEPSG}`)) {
                throw new Error(`EPSG ${originalEPSG} není podporován.`);
            }

            return features.map(feature => {
                let reprojectedGeometry;

                switch (feature.geometry.type) {
                    case "Point":
                        console.log('--- Reprojektujeme Point');
                        reprojectedGeometry = transformPoint(feature.geometry.coordinates, originalEPSG);
                        break;

                    case "LineString":
                    case "MultiPoint":
                        console.log('--- Reprojektujeme LineString nebo MultiPoint');
                        reprojectedGeometry = feature.geometry.coordinates.map(c => transformPoint(c, originalEPSG));
                        break;

                    case "Polygon":
                    case "MultiLineString":
                        console.log('--- Reprojektujeme Polygon nebo MultiLineString');
                        reprojectedGeometry = feature.geometry.coordinates.map(ring =>
                            ring.map(c => transformPoint(c, originalEPSG))
                        );
                        break;

                    case "MultiPolygon":
                        console.log('--- Reprojektujeme MultiPolygon');
                        reprojectedGeometry = feature.geometry.coordinates.map(polygon =>
                            polygon.map(ring =>
                                ring.map(c => transformPoint(c, originalEPSG))
                            )
                        );
                        break;

                    default:
                        throw new Error(`Nepodporovaný typ geometrie: ${feature.geometry.type}`);
                }

                return {
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: reprojectedGeometry
                    }
                };
            });
        } catch (error) {
            console.error(`Chyba při reprojekci: ${error.message}`);
            return null;
        }
    }
};

module.exports = reprojectionHelper;
