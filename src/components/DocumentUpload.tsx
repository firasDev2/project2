import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (content: string) => void;
  isProcessing: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, isProcessing }) => {
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onUpload(content);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const sampleDocument = `# Software Requirements Specification: E-commerce Platform

## User Stories

### US-001: User Registration
As a new customer, I want to create an account so that I can make purchases and track my orders.

**Business Need:** Increase customer retention by allowing users to save preferences and order history.

**Acceptance Criteria:**
- User can register with email and password
- Email verification is required before account activation
- Password must meet security requirements (8+ characters, mixed case, numbers)
- User receives welcome email after successful registration

**Dependencies:** Email service integration, user database schema

**Technical Details:** 
- Implement OAuth2 for social login options
- Use bcrypt for password hashing
- Rate limiting for registration attempts

### US-002: Product Search
As a customer, I want to search for products by name or category so that I can quickly find what I need.

**Business Context:** Improve user experience and reduce bounce rate

**Acceptance Criteria:**
- Search bar accepts text input and displays results in real-time
- Results can be filtered by price, rating, category
- Search suggestions appear as user types
- No results found page displays alternative suggestions

**Out of Scope:** Voice search functionality

**Testing:** 
- Unit tests for search algorithm
- Performance testing with large product catalogs
- A/B testing different search result layouts

**Security:** Input sanitization to prevent SQL injection

**Definition of Done:**
- Feature tested in staging environment
- Performance benchmarks met
- Accessibility standards compliant
- Documentation updated`;

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
                <h3 className="text-lg font-medium text-gray-900">Processing Document</h3>
                <p className="text-gray-500">Extracting requirements using AI...</p>
              </div>
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