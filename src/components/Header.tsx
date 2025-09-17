import React from 'react';
import { FileText, Download, Settings, RefreshCw, CheckCircle, Upload } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  onReExtract: () => void;
  onExport: () => void;
  onUploadToJira: () => void;
  onSettings: () => void;
  extractionStatus: 'idle' | 'processing' | 'completed';
  validatedCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onReExtract,
  onExport,
  onUploadToJira,
  onSettings,
  extractionStatus,
  validatedCount,
  totalCount
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
                <p className="text-sm text-gray-500">
                  {validatedCount} of {totalCount} requirements validated
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onReExtract}
              disabled={extractionStatus === 'processing'}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${extractionStatus === 'processing' ? 'animate-spin' : ''}`} />
              Re-extract
            </button>

            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <button
              onClick={onUploadToJira}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload to Jira
            </button>

            <button
              onClick={onSettings}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};