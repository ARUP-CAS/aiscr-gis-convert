import { useState, useCallback } from 'react';

function useGPXProcessing() {
    const [gpxData, setGPXData] = useState(null);
    const [gpxExportSettings, setGPXExportSettings] = useState({ labelAttribute: '' });
    const [selectedGPXFeatures, setSelectedGPXFeatures] = useState([]); // Nový stav pro vybrané prvky
    const [gpxExportContent, setGPXExportContent] = useState('');

    const handleGPXExportSettingsChange = useCallback((settings) => {
        setGPXExportSettings(settings);
    }, []);

    const handleGPXFeatureSelection = useCallback((features) => {
        setSelectedGPXFeatures(features); // Aktualizace vybraných prvků
    }, []);

    const handleGPXRefresh = () => {
        window.location.reload();
    };

    const handleGPXReupload = () => {
        alert('Dočasně dojde k obnovení stránky');
        window.location.reload();
    };

    // Generování exportního obsahu na základě vybraných prvků
    const generateGPXExportContent = useCallback(() => {
        if (selectedGPXFeatures.length > 0) {
            const header = '"label","geometry"';
            const rows = selectedGPXFeatures.map(feature =>
                `"${feature.label || 'Prvek'}","${feature.geometry}"`
            );
            const content = [header, ...rows].join('\n');
            setGPXExportContent(content);
        } else {
            setGPXExportContent('');
        }
    }, [selectedGPXFeatures]);

    return {
        gpxData,
        setGPXData,
        gpxExportContent,
        handleGPXExportSettingsChange,
        handleGPXFeatureSelection,
        selectedGPXFeatures, // Přidáme tento stav pro použití v komponentách
        generateGPXExportContent,
        handleGPXRefresh,
        handleGPXReupload,
    };
}

export default useGPXProcessing;
