const fs = require('fs').promises;
const DxfParser = require('dxf-parser');
const TerraformerWKT = require('terraformer-wkt-parser');
const { getEPSG } = require('../utils/epsgHelper');
const { dxfCircleToPolygon } = require('../utils/circleToPolygonUtil');

const ATTRIBUTE_MAPPING = {
    'handle': 'ID prvku',
    'layer': 'Vrstva',
    'text': 'Text',
    'name': 'Název'
};

async function processDXF(filePath) {
    console.log(`Processing DXF file: ${filePath}`);
    try {
        const dxfContent = await fs.readFile(filePath, 'utf-8');
        const parser = new DxfParser();
        const dxf = parser.parse(dxfContent);

        const { features, relevantAttributes } = processEntities(dxf.entities);
        const epsgInfo = await getEPSG(filePath, dxf.entities);
    
        return {
            features,
            relevantAttributes: relevantAttributes.map(attr => ATTRIBUTE_MAPPING[attr] || attr),
            epsgInfo,
            fileName: filePath.split('/').pop()
        };
    } catch (error) {
        console.error(`Error processing DXF file ${filePath}:`, error);
        throw error;
    }
}

function processEntities(entitiesData) {
    const features = [];
    const relevantAttributes = new Set();
    let idCounter = 1; // Inkrementální čítač pro unikátní ID

    entitiesData.forEach(entity => {
        const feature = convertEntityToFeature(entity, idCounter);
        if (feature) {
            features.push(feature);
            Object.keys(feature.properties).forEach(attr => relevantAttributes.add(attr));
            idCounter++; // Zvýšíme čítač pro další prvek
        }
    });

    return { features, relevantAttributes: Array.from(relevantAttributes) };
}

function convertEntityToFeature(entity, idCounter) {
    let geometry, geometryType;

    try {
        switch (entity.type) {
            case 'POINT':
                if (entity.position && typeof entity.position.x === 'number' && typeof entity.position.y === 'number') {
                    geometry = { type: 'Point', coordinates: [entity.position.x, entity.position.y] };
                    geometryType = 'point';
                }
                break;
            case 'LINE':
                if (Array.isArray(entity.vertices) && entity.vertices.length === 2 &&
                    entity.vertices[0].x !== undefined && entity.vertices[0].y !== undefined &&
                    entity.vertices[1].x !== undefined && entity.vertices[1].y !== undefined) {
                    geometry = {
                        type: 'LineString',
                        coordinates: [
                            [entity.vertices[0].x, entity.vertices[0].y],
                            [entity.vertices[1].x, entity.vertices[1].y]
                        ]
                    };
                    geometryType = 'line';
                }
                break;
            case 'LWPOLYLINE':
            case 'POLYLINE':
                if (Array.isArray(entity.vertices) && entity.vertices.length > 1) {
                    const coordinates = entity.vertices.map(v => [v.x, v.y]).filter(coord => coord.every(c => typeof c === 'number'));
                    if (coordinates.length > 1) {
                        geometry = {
                            type: entity.shape ? 'Polygon' : 'LineString',
                            coordinates: entity.shape ? [coordinates] : coordinates
                        };
                        geometryType = entity.shape ? 'polygon' : 'line';
                    }
                }
                break;
            case 'CIRCLE':
                const circleResult = dxfCircleToPolygon(entity);
                geometry = circleResult.geometry;
                geometryType = circleResult.geometryType;
                break;
            case 'TEXT':
            case 'MTEXT':
                if (entity.position && typeof entity.position.x === 'number' && typeof entity.position.y === 'number') {
                    geometry = { type: 'Point', coordinates: [entity.position.x, entity.position.y] };
                    geometryType = 'text';
                }
                break;
            default:
                console.log(`Unsupported entity type: ${entity.type}`);
                return null;
        }

        if (!geometry) {
            console.log(`Invalid geometry for entity type: ${entity.type}`);
            return null;
        }

        const properties = {
            'ID prvku': entity.handle,
            'Vrstva': entity.layer,
        };

        if (entity.type === 'TEXT' || entity.type === 'MTEXT') {
            properties['Text'] = entity.text;
        }

        if (entity.name) {
            properties['Název'] = entity.name;
        }

        return {
            wkt: TerraformerWKT.convert(geometry),
            geometryType,
            properties: {
                'ID prvku': entity.handle,  // Viditelný atribut
                'Vrstva': entity.layer,
                // Další relevantní atributy...
            },
            systemoveID: `Prvek_${idCounter}`  // Interní unikátní ID bez diakritiky
        };
        
    } catch (error) {
        console.error(`Error processing entity of type ${entity.type}:`, error);
        console.log('Problematic entity:', JSON.stringify(entity, null, 2));
        return null;
    }
}

module.exports = { processDXF };
