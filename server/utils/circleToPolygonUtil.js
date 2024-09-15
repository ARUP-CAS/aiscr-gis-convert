// Soubor: circleToPolygonUtil.js

const DEFAULT_SEGMENTS = 32;

/**
 * Převede kružnici na aproximovaný polygon
 * @param {number} centerX - X souřadnice středu kružnice
 * @param {number} centerY - Y souřadnice středu kružnice
 * @param {number} radius - Poloměr kružnice
 * @param {number} [segments=DEFAULT_SEGMENTS] - Počet segmentů pro aproximaci
 * @returns {string} WKT reprezentace polygonu
 */
function circleToPolygon(centerX, centerY, radius, segments = DEFAULT_SEGMENTS) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push(`${x} ${y}`);
    }
    // Přidáme první bod znovu na konec, aby se polygon uzavřel
    points.push(points[0]);

    return `POLYGON((${points.join(',')}))`;
}

/**
 * Převede DXF CIRCLE entitu na WKT polygon
 * @param {Object} circleEntity - DXF CIRCLE entita
 * @param {number} [segments=DEFAULT_SEGMENTS] - Počet segmentů pro aproximaci
 * @returns {Object} Objekt obsahující WKT reprezentaci a metadata
 */
function dxfCircleToPolygon(circleEntity, segments = DEFAULT_SEGMENTS) {
    const { center, radius } = circleEntity;
    const wkt = circleToPolygon(center.x, center.y, radius, segments);
    
    return {
        wkt,
        geometryType: 'polygon',
        originalType: 'CIRCLE',
        metadata: {
            center: { x: center.x, y: center.y },
            radius
        }
    };
}

module.exports = {
    circleToPolygon,
    dxfCircleToPolygon,
    DEFAULT_SEGMENTS
};