// client/src/utils/epsgUtils.js

// Načtení všech EPSG dat z epsg-index
import allEpsgData from 'epsg-index/all.json';

/**
 * Funkce pro získání názvu souřadnicového systému na základě EPSG kódu
 * @param {number|string} epsgCode - EPSG kód, který chceme převést na název
 * @returns {string} Název souřadnicového systému nebo zpráva o neznámém kódu
 */
export function getEpsgName(epsgCode) {
    // Kontrola, zda epsgCode není null nebo undefined
    if (!epsgCode) {
        return 'Název neznámý';
    }

    // Převod kódu na řetězec, protože klíče JSON jsou řetězce
    const epsgStr = epsgCode.toString();

    // Vyhledání odpovídajícího záznamu v epsg-index
    const epsgData = allEpsgData[epsgStr];

    if (epsgData && epsgData.name) {
        return epsgData.name;
    } else {
        return 'Název neznámý';
    }
}

export function getEpsgFullName( epsgCode){
    // Kontrola, zda epsgCode není null nebo undefined
    if (!epsgCode) {
        return 'Název neznámý';
    }

    const name = getEpsgName(epsgCode);

    const fullName = `${name} (${epsgCode})`;

    return fullName;
}
