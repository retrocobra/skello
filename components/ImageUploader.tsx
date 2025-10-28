
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange, isProcessing }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      onFilesChange(fileArray);
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  }, [onFilesChange]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full">
      <div 
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`relative block w-full rounded-lg border-2 border-dashed p-12 text-center hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 dark:border-gray-600'} ${isProcessing ? 'cursor-not-allowed' : ''}`}
      >
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <span className="mt-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
          Glissez-déposez vos captures d'écran ici
        </span>
        <span className="mt-1 block text-sm text-gray-500">ou</span>
        <label htmlFor="file-upload" className={`relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <span>téléchargez des fichiers</span>
          <input 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            multiple 
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={isProcessing}
          />
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
      </div>

      {previews.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aperçus :</h3>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {previews.map((src, index) => (
              <li key={index} className="relative">
                <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <img src={src} alt="" className="pointer-events-none object-cover group-hover:opacity-75" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
