import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import mammoth from "mammoth";


interface DocumentUploadProps {
  onUpload: (content: string) => void;
  isProcessing: boolean;
  llmThinking?: string; 
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onUpload, 
  isProcessing,
  llmThinking = ""
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

const handleFile = (file: File) => {
  if (file.name.endsWith(".docx")) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const result = await mammoth.extractRawText({ arrayBuffer });
      onUpload(result.value); // Extracted text
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onUpload(content);
    };
    reader.readAsText(file);
  }
};

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const sampleDocument = `# Software Requirements Specification: E-commerce Platform\n...`; // shortened for brevity

  const handleSampleUpload = () => {
    onUpload(sampleDocument);
  };

  

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Processing Document
                </h3>
                <p className="text-gray-500">The AI is thinking...</p>
              </div>

              {/* 👇 Live LLM thinking area */}
              {llmThinking && (
                <div className="mt-4 text-left bg-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto text-sm text-gray-700 font-mono">
                  <div className="whitespace-pre-wrap">{llmThinking}</div>
                  <div className="animate-pulse">▋</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Requirements Document
              </h3>
              <p className="text-gray-500 mb-6">
                Drop your .docx, .pdf, or .md file here, or click to browse
              </p>

              <input
                type="file"
                accept=".docx,.pdf,.md,.txt"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </label>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  Or try with a sample document:
                </p>
                <button
                  onClick={handleSampleUpload}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Use Sample E-commerce Requirements
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
