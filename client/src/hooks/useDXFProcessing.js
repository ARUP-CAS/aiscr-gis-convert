import { useState, useCallback } from 'react';

function useDXFProcessing() {
    const [dxfData, setDXFData] = useState(null);
    const [dxfLabelAttribute, setDXFLabelAttribute] = useState('');
    const [dxfExportSettings, setDXFExportSettings] = useState({ labelAttribute: '' });
    const [selectedDXFFeatures, setSelectedDXFFeatures] = useState([]);
    const [dxfExportContent, setDXFExportContent] = useState('');

    const handleDXFExportSettingsChange = useCallback((settings) => {
        setDXFExportSettings(settings);
    }, []);

    const handleDXFFeatureSelection = useCallback((features) => {
        setSelectedDXFFeatures(features);
    }, []);

    // Funkce pro obnovení celé aplikace
    const handleDXFRefresh = () => {
        // Implementace vyčištění dat pomocí obnovení stránky
        window.location.reload();
    };

    // Funkce pro vyčištění dat a opětovné nahrání souborů
    const handleDXFReupload = () => {
        alert('Implementace vyčištění dat a opětovného nahrání souborů. Dočasně dojde k obnovení stránky');
        window.location.reload();
       // TODO: Implementace vyčištění dat a opětovného nahrání souborů
    };

    const generateDXFExportContent = useCallback(() => {
        if (dxfExportSettings.labelAttribute && selectedDXFFeatures.length > 0) {
            const header = '"label","geometry"';
            const rows = selectedDXFFeatures.map(feature =>
                `"${feature.properties[dxfExportSettings.labelAttribute] || ''}","${feature.wkt}"`
            );
            const content = [header, ...rows].join('\n');
            setDXFExportContent(content);
        } else {
            setDXFExportContent('');
        }
    }, [selectedDXFFeatures, dxfExportSettings]);

    return {
        dxfData,
        setDXFData,
        dxfExportContent,
        handleDXFExportSettingsChange,
        handleDXFFeatureSelection,
        dxfLabelAttribute,
        setDXFLabelAttribute,
        handleDXFRefresh,
        handleDXFReupload
    };
}

export default useDXFProcessing;
