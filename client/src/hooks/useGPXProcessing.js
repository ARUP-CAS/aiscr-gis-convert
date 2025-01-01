import { useState, useCallback } from 'react';

/**
 * Custom hook pro zpracování GPX dat v aplikaci.
 * Tento hook spravuje stav dat, vybrané prvky, exportní obsah a nastavení.
 */
function useGPXProcessing() {
    const [gpxData, setGPXData] = useState(null); // GPX data načtená ze souboru
    const [gpxExportSettings, setGPXExportSettings] = useState({ labelAttribute: '' }); // Nastavení pro export
    const [selectedGPXFeatures, setSelectedGPXFeatures] = useState([]); // Stav pro vybrané prvky
    const [gpxExportContent, setGPXExportContent] = useState(''); // Obsah exportovaného CSV

    /**
     * Funkce pro aktualizaci nastavení exportu.
     * @param {Object} settings - Nové nastavení exportu.
     */
    const handleGPXExportSettingsChange = useCallback((settings) => {
        setGPXExportSettings(settings);
    }, []);

    /**
     * Funkce pro aktualizaci vybraných prvků.
     * @param {Array} features - Seznam vybraných prvků.
     */
    const handleGPXFeatureSelection = useCallback((features) => {
        setSelectedGPXFeatures(features);
    }, []);

    /**
     * Funkce pro obnovení aplikace (aktualizace stránky).
     */
    const handleGPXRefresh = () => {
        window.location.reload();
    };

    /**
     * Funkce pro opětovné nahrání souboru (aktualizace stránky).
     */
    const handleGPXReupload = () => {
        alert('Dočasně dojde k obnovení stránky');
        window.location.reload();
    };

    /**
     * Generování obsahu exportního CSV na základě vybraných prvků.
     */
    const generateGPXExportContent = useCallback(() => {
        if (selectedGPXFeatures.length > 0) {
            const header = '"label","geometry"'; // Hlavička CSV
            const rows = selectedGPXFeatures.map(feature => 
                `"${feature.label || 'Prvek'}","${feature.geometry}"` // Obsah řádku CSV
            );
            const content = [header, ...rows].join('\n'); // Sloučení hlavičky a řádků
            setGPXExportContent(content);
        } else {
            setGPXExportContent(''); // Pokud nejsou vybrané prvky, obsah je prázdný
        }
    }, [selectedGPXFeatures]);

    return {
        gpxData, // Stav pro GPX data
        setGPXData, // Funkce pro nastavení GPX dat
        gpxExportContent, // Obsah exportovaného CSV
        handleGPXExportSettingsChange, // Funkce pro změnu nastavení exportu
        handleGPXFeatureSelection, // Funkce pro změnu vybraných prvků
        selectedGPXFeatures, // Stav pro vybrané prvky
        generateGPXExportContent, // Funkce pro generování exportního obsahu
        handleGPXRefresh, // Funkce pro obnovení aplikace
        handleGPXReupload // Funkce pro opětovné nahrání souboru
    };
}

export default useGPXProcessing;
