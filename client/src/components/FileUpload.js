import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import FileUploadError from './FileUploadError';
import FileUploadSelection from './FileUploadSelection';

// Komponenta pro nahrávání shapefile souborů
// Umožňuje výběr souborů, kontrolu jejich úplnosti a nahrání na server
const FileUpload = forwardRef(({ setShapefileData, onReset }, ref) => {
    // Stav pro indikaci probíhajícího nahrávání
    const [isLoading, setIsLoading] = useState(false);
    // Seznam vybraných souborů
    const [selectedFiles, setSelectedFiles] = useState([]);
    // Objekt obsahující případné chyby
    const [errors, setErrors] = useState(null);
    // Seznam kompletních datasetů (obsahují všechny povinné soubory)
    const [completeDatasets, setCompleteDatasets] = useState([]);
    // Reference na input element pro výběr souborů
    const fileInputRef = useRef(null);

    // Definice povinných a volitelných přípon souborů
    const requiredExtensions = ['.shp', '.dbf'];
    const optionalExtensions = ['.prj', '.cpg'];
    const allSupportedExtensions = [...requiredExtensions, ...optionalExtensions];

    // Funkce volaná při změně vybraných souborů
    const handleFileChange = (event) => {
        // Převedení FileList na pole
        const files = Array.from(event.target.files);
        // Aktualizace stavu s novými soubory
        setSelectedFiles(files);
        // Vymazání případných předchozích chyb
        setErrors(null);
        // Vymazání seznamu kompletních datasetů
        setCompleteDatasets([]);
        // Volání funkce pro reset stavu v nadřazené komponentě
        onReset();
    };

    // Funkce pro nahrání souborů na server
    const uploadFiles = useCallback(async (datasetName, datasetFiles) => {
        setIsLoading(true);
        setErrors(null);

        // Kontrola, zda byly vybrány nějaké soubory
        if (!datasetFiles || datasetFiles.length === 0) {
            setErrors({ 'Chyba': ['Nebyly vybrány žádné soubory pro nahrání'] });
            setIsLoading(false);
            return;
        }

        // Vytvoření FormData objektu pro odeslání souborů
        const formData = new FormData();
        datasetFiles.forEach((file) => {
            formData.append('shpFiles', file);
        });

        try {
            // Odeslání požadavku na server
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Nahrávání souboru selhalo');
            }

            // Zpracování odpovědi ze serveru
            const data = await response.json();
            // Aktualizace stavu shapefile dat v nadřazené komponentě
            setShapefileData(data);
        } catch (error) {
            // Nastavení chybového stavu při selhání nahrávání
            setErrors({ 'Chyba serveru': ['Zkuste to prosím znovu'] });
        } finally {
            // Resetování stavů po dokončení nahrávání
            setIsLoading(false);
            setSelectedFiles([]);
            setCompleteDatasets([]);
        }
    }, [setShapefileData]);

    // Funkce pro zpracování nahrávání souborů
    const handleFileUpload = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        setErrors(null);
        setCompleteDatasets([]);

        // Vytvoření objektu s datasety
        const datasets = {};
        selectedFiles.forEach(file => {
            const fileName = file.name.toLowerCase();
            const lastDotIndex = fileName.lastIndexOf('.');
            const baseName = fileName.substring(0, lastDotIndex);
            const extension = fileName.substring(lastDotIndex);
            if (!datasets[baseName]) {
                datasets[baseName] = new Set();
            }
            datasets[baseName].add(extension);
        });

        // Kontrola úplnosti datasetů
        const incompleteDatasets = {};
        const complete = [];
        Object.entries(datasets).forEach(([baseName, extensions]) => {
            const missingFiles = requiredExtensions.filter(ext => !extensions.has(ext));
            if (missingFiles.length > 0) {
                incompleteDatasets[baseName] = missingFiles;
            } else {
                complete.push(baseName);
            }
        });

        setCompleteDatasets(complete);

        if (complete.length === 0) {
            // Žádné kompletní datasety, nastavení chybového stavu
            setErrors(incompleteDatasets);
            setIsLoading(false);
            return;
        }

        if (complete.length === 1) {
            // Jeden kompletní dataset, automatické nahrání
            const datasetName = complete[0];
            const datasetFiles = selectedFiles.filter(file =>
                file.name.toLowerCase().startsWith(datasetName.toLowerCase())
            );
            await uploadFiles(datasetName, datasetFiles);
        } else {
            // Více kompletních datasetů, čekání na výběr uživatele
            setIsLoading(false);
        }
    }, [isLoading, selectedFiles, requiredExtensions, uploadFiles]);


    // Effect hook pro spuštění nahrávání při změně vybraných souborů
    useEffect(() => {
        if (selectedFiles.length > 0 && !isLoading && completeDatasets.length === 0 && !errors) {
            handleFileUpload();
        }
    }, [selectedFiles, handleFileUpload, isLoading, completeDatasets, errors]);

    // Funkce pro zpracování výběru datasetu uživatelem
    const handleSelectDataset = (datasetName) => {
        // Filtrování souborů pro vybraný dataset
        const datasetFiles = selectedFiles.filter(file =>
            file.name.toLowerCase().startsWith(datasetName.toLowerCase())
        );

        // Kontrola přítomnosti všech povinných souborů
        const hasRequiredFiles = requiredExtensions.every(ext =>
            datasetFiles.some(file => file.name.toLowerCase().endsWith(ext))
        );

        if (!hasRequiredFiles) {
            // Nalezení chybějících souborů
            const missingFiles = requiredExtensions.filter(ext =>
                !datasetFiles.some(file => file.name.toLowerCase().endsWith(ext))
            );
            // Nastavení chybového stavu
            setErrors({
                [datasetName]: missingFiles
            });
            return;
        }

        // Nahrání vybraného datasetu
        uploadFiles(datasetName, datasetFiles);
        // Reset seznamu kompletních datasetů
        setCompleteDatasets([]);
    };

    // Funkce pro otevření dialogu pro výběr souborů
    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    // Zpřístupnění metody openFileDialog pro nadřazenou komponentu
    useImperativeHandle(ref, () => ({
        openFileDialog
    }));

    // Renderování komponenty
    return (
        <div>
            <Form.Group controlId="formFile">
                <Form.Label>
                    Vyberte soubory shapefilu
                    <br />
                    <small className="text-muted">Povinné: {requiredExtensions.join(', ')}</small>
                    <br />
                    <small className="text-muted">Doporučené: {optionalExtensions.join(', ')}</small>
                </Form.Label>
                <Form.Control
                    ref={fileInputRef}
                    type="file"
                    name="formFile"
                    multiple
                    accept={allSupportedExtensions.join(',')}
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
            </Form.Group>
            {isLoading && (
                <div className="text-center mt-3">
                    <FontAwesomeIcon icon={faSpinner} spin /> Nahrávání...
                </div>
            )}
            {errors && Object.keys(errors).length > 0 && (
                <FileUploadError errors={errors} onRetry={openFileDialog} />
            )}
            {completeDatasets.length > 1 && !errors && !isLoading && (
                <FileUploadSelection
                    completeDatasets={completeDatasets}
                    onSelectDataset={handleSelectDataset}
                    onRetry={openFileDialog}
                />
            )}
        </div>
    );
});

export default FileUpload;