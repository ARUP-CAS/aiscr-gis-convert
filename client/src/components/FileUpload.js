import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import FileUploadError from './FileUploadError';
import FileUploadSelection from './FileUploadSelection';
import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '../config';
import { validateFileSize, validateFileType, groupFilesByDataset, checkDatasetCompleteness } from '../utils/fileUtils';
import { API_URL } from '../config';

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
        const files = Array.from(event.target.files);
        
        // Kontrola velikosti a typu souborů
        const invalidFiles = files.filter(file => !validateFileSize(file) || !validateFileType(file));
        
        if (invalidFiles.length > 0) {
            setErrors({
                'Invalid Files': invalidFiles.map(file => 
                    `${file.name} (${!validateFileSize(file) ? 'příliš velký' : 'nepodporovaný typ'})`
                )
            });
            setSelectedFiles([]);
            setCompleteDatasets([]);
            return;
        }

        setSelectedFiles(files);
        setErrors(null);
        setCompleteDatasets([]);
        onReset();

        // Automaticky spustit nahrávání, pokud jsou soubory validní
        handleFileUpload(files);
    };

    // Funkce pro nahrání souborů na server
    const uploadFiles = useCallback(
        async (datasetName, datasetFiles) => {
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
                const response = await fetch(`${API_URL}/upload`, {
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
        }, [setShapefileData]
    );

    // Funkce pro zpracování nahrávání souborů
    const handleFileUpload = useCallback(async (filesToUpload) => {
        if (isLoading) return;

        setIsLoading(true);
        setErrors(null);

        const datasets = groupFilesByDataset(filesToUpload);
        
        const incompleteDatasets = {};
        const complete = [];
        
        Object.entries(datasets).forEach(([baseName, extensions]) => {
            if (checkDatasetCompleteness(extensions)) {
                complete.push(baseName);
            } else {
                incompleteDatasets[baseName] = SUPPORTED_EXTENSIONS.required.filter(ext => !extensions.has(ext));
            }
        });

        setCompleteDatasets(complete);

        if (complete.length === 0) {
            setErrors(incompleteDatasets);
            setIsLoading(false);
            return;
        }

        if (complete.length === 1) {
            const datasetName = complete[0];
            const datasetFiles = filesToUpload.filter(file =>
                file.name.toLowerCase().startsWith(datasetName.toLowerCase())
            );
            await uploadFiles(datasetName, datasetFiles);
        } else {
            setIsLoading(false);
        }
    }, [isLoading, uploadFiles]);


    
    // Effect hook pro spuštění nahrávání při změně vybraných souborů
    useEffect(() => {
        if (selectedFiles.length > 0 && !isLoading && completeDatasets.length === 0 && !errors) {
            handleFileUpload(selectedFiles);
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
    const openFileDialog = useCallback(() => {
        fileInputRef.current.click();
    }, []);

    const resetFileInput = useCallback(() => {
        setErrors(null);
        setSelectedFiles([]);
        setCompleteDatasets([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        openFileDialog();
    }, []);

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
                    <small className="text-muted">Je možné vybrat více kompletních SHP (např. všechny soubory v adresáři), následně budete vyzváni k výběru jednoho konkrétního.</small>
                    <br />
                    <small className="text-muted fw-bolder">Povinné: {SUPPORTED_EXTENSIONS.required.join(', ')}</small>
                    <br />
                    <small className="text-muted fw-bolder">Doporučené: {SUPPORTED_EXTENSIONS.optional.join(', ')}</small>
                    <br />
                    <small className="text-muted">Maximální velikost souboru: {MAX_FILE_SIZE / (1024 * 1024)} MB</small>
                </Form.Label>
                <Form.Control
                    ref={fileInputRef}
                    type="file"
                    name="formFile"
                    multiple
                    accept={[...SUPPORTED_EXTENSIONS.required, ...SUPPORTED_EXTENSIONS.optional].join(',')}
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
            </Form.Group>
            {isLoading && (
                <div className="text-center mt-3">
                    <FontAwesomeIcon icon={faSpinner} spin /> Nahrávání...
                </div>
            )}
            {errors && (
                <FileUploadError 
                    errors={errors} 
                    onRetry={resetFileInput}
                />
            )}
            {completeDatasets.length > 1 && !errors && !isLoading && (
                <FileUploadSelection
                    completeDatasets={completeDatasets}
                    onSelectDataset={handleSelectDataset}
                    onRetry={resetFileInput}
                />
            )}
        </div>
    );
});

export default FileUpload;