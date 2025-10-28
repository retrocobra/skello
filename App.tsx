
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultsTable from './components/ResultsTable';
import { ExcelIcon, SpinnerIcon, ErrorIcon } from './components/icons';
import { fileToBase64 } from './utils/fileUtils';
import { downloadCsv } from './utils/csvUtils';
import { extractDataFromImages } from './services/geminiService';
import { ExtractedStoreData } from './types';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedStoreData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setExtractedData([]);
    setError(null);
  }, []);

  const handleExtractData = useCallback(async () => {
    if (files.length === 0) {
      setError("Veuillez d'abord télécharger des images.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExtractedData([]);

    try {
      const imagePromises = files.map(file => 
        fileToBase64(file).then(base64Data => ({
          mimeType: file.type,
          data: base64Data,
        }))
      );
      
      const imagePayloads = await Promise.all(imagePromises);
      const data = await extractDataFromImages(imagePayloads);
      
      setExtractedData(data);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
    } finally {
      setIsProcessing(false);
    }
  }, [files]);
  
  const handleDownload = () => {
    downloadCsv(extractedData, `rapport_skello_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Skello Data</span>
            <span className="block text-indigo-600">Extractor</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Automatisez la saisie de vos données. Téléchargez vos captures d'écran Skello et obtenez un rapport structuré en quelques secondes.
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">1. Télécharger les Captures d'Écran</h2>
            <ImageUploader onFilesChange={handleFilesChange} isProcessing={isProcessing} />
            
            <div className="mt-8 text-center">
              <button
                onClick={handleExtractData}
                disabled={isProcessing || files.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Extraction en cours...
                  </>
                ) : (
                  "2. Extraire les Données"
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 bg-red-100 dark:bg-red-900/[.3] border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
              <div className="flex">
                <div className="py-1"><ErrorIcon className="h-6 w-6 text-red-500 mr-4"/></div>
                <div>
                  <p className="font-bold">Erreur</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
             <div className="mt-8 text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
                <SpinnerIcon className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
                <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Analyse des images...</p>
                <p className="text-sm text-gray-500">L'IA de Gemini est en train de lire vos données. Cela peut prendre un moment.</p>
            </div>
          )}

          {extractedData.length > 0 && !isProcessing && (
            <div className="mt-12">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Résultats</h2>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <ExcelIcon className="-ml-1 mr-2 h-5 w-5" />
                        Télécharger en CSV
                    </button>
                </div>
              <ResultsTable data={extractedData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
