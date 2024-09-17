import { useState, useCallback, useRef, useEffect } from 'react';

// Hook pro zpracování shapefile dat a řízení exportu
function useShapefileProcessing() {
    // State pro uchování dat shapefilu
    const [shapefileData, setShapefileData] = useState(null);
    // State pro nastavení exportu (EPSG kód a atribut pro label)
    const [exportSettings, setExportSettings] = useState({ epsg: '', labelAttribute: '' });
    // State pro vybrané prvky (features)
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    // State pro obsah exportu
    const [exportContent, setExportContent] = useState('');
    // Reference na komponentu pro nahrávání souborů
    const fileUploadRef = useRef(null);

    // Funkce pro nastavení dat shapefilu a automatické nastavení exportu
    const handleSetShapefileData = useCallback((data) => {
        setShapefileData(data);
        // Automaticky nastavit EPSG a labelAttribute, pokud jsou k dispozici
        if (data && data.epsg) {
            setExportSettings(prev => ({ ...prev, epsg: data.epsg }));
        }
        if (data && data.attributes && data.attributes.length > 0) {
            setExportSettings(prev => ({ ...prev, labelAttribute: data.attributes[0] }));
        }
        // Nastavit vybrané features
        if (data && data.features) {
            setSelectedFeatures(data.features);
        }
    }, []);

    // Funkce pro změnu nastavení exportu
    const handleExportSettingsChange = useCallback((settings) => {
        setExportSettings(settings);
    }, []);

    // Funkce pro změnu výběru prvků
    const handleFeatureSelection = useCallback((features) => {
        setSelectedFeatures(features);
    }, []);

    // Funkce pro generování obsahu exportu
    // Funkce pro generování obsahu exportu
    const generateExportContent = useCallback(() => {
        if (exportSettings.epsg && exportSettings.labelAttribute && selectedFeatures.length > 0) {

            const header = '"label","epsg","geometry"';

            // Funkce pro získání hodnoty atributu label a nahrazení prázdných hodnot
            const getLabel = (feature) => {
                // Kontrola, zda je editedLabel nebo hodnota z labelAttribute prázdná, pokud ano, nahradíme hodnotou 'Neznámý label'
                return feature.editedLabel !== undefined
                    ? feature.editedLabel
                    : (feature.properties[exportSettings.labelAttribute] || 'Neznámý label');
            };

            // Generování řádků exportu
            const rows = selectedFeatures.map(feature => {
                const label = getLabel(feature);
                const epsg = exportSettings.epsg;
                const geometry = feature.wkt;

                // Sestavení řádku CSV
                return `"${label}","${epsg}","${geometry}"`;
            });

            // Spojení hlavičky a řádků do finálního obsahu
            const content = [header, ...rows].join('\n');
            setExportContent(content);

        } else {
            setExportContent('');  // Při neplatných datech export nevytvoříme
        }
    }, [selectedFeatures, exportSettings]);


    // Effect pro automatické generování obsahu exportu při změně relevantních dat
    useEffect(() => {
        generateExportContent();
    }, [generateExportContent]);

    // Funkce pro obnovení celé aplikace
    const handleRefresh = () => {
        // Implementace vyčištění dat pomocí obnovení stránky
        window.location.reload();
    };

    // Funkce pro vyčištění dat a opětovné nahrání souborů
    const handleReupload = () => {
        setShapefileData(null);
        setExportSettings({ epsg: '', labelAttribute: '' });
        setSelectedFeatures([]);
        setExportContent('');
        if (fileUploadRef.current) {
            fileUploadRef.current.openFileDialog();
        }
    };

    // Vrácení objektu s daty a funkcemi pro použití v komponentách
    return {
        shapefileData,
        setShapefileData: handleSetShapefileData,
        exportSettings,
        selectedFeatures,
        exportContent,
        fileUploadRef,
        handleExportSettingsChange,
        handleFeatureSelection,
        handleRefresh,
        handleReupload
    };
}

export default useShapefileProcessing;