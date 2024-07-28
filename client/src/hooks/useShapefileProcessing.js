// src/hooks/useShapefileProcessing.js
import { useState, useCallback, useRef, useEffect } from 'react';

function useShapefileProcessing() {
    const [shapefileData, setShapefileData] = useState(null);
    const [exportSettings, setExportSettings] = useState({ epsg: '', labelAttribute: '' });
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [exportContent, setExportContent] = useState('');
    const fileUploadRef = useRef(null);

    const handleExportSettingsChange = useCallback((settings) => {
        setExportSettings(settings);
    }, []);

    const handleFeatureSelection = useCallback((features) => {
        setSelectedFeatures(features);
    }, []);

    const generateExportContent = useCallback(() => {
        if (exportSettings.epsg && exportSettings.labelAttribute && selectedFeatures.length > 0) {
            const header = '"label","epsg","geometry"';
            const rows = selectedFeatures.map(feature =>
                `"${feature.editedLabel !== undefined ? feature.editedLabel : (feature.properties[exportSettings.labelAttribute] || '')}","${exportSettings.epsg}","${feature.wkt}"`
            );
            const content = [header, ...rows].join('\n');
            setExportContent(content);
        } else {
            setExportContent('');
        }
    }, [selectedFeatures, exportSettings]);

    useEffect(() => {
        generateExportContent();
    }, [generateExportContent]);

    const handleRefresh = () => {
        // Implementace vyčištění dat
        window.location.reload();
    };

    const handleReupload = () => {
        setShapefileData(null);
        setExportSettings({ epsg: '', labelAttribute: '' });
        setSelectedFeatures([]);
        setExportContent('');
        if (fileUploadRef.current) {
            fileUploadRef.current.openFileDialog();
        }
    };

    return {
        shapefileData,
        setShapefileData,
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