import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import mammoth from "mammoth";


interface DocumentUploadProps {
  onUpload: (content: string) => void;
  onUseSample: () => void;
  isProcessing: boolean;
  llmThinking?: string; 
}

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

  const sampleDocument = `# Software Requirements Specification: E-commerce Platform

## 1. User Management
En tant qu'utilisateur, je veux créer un compte pour pouvoir accéder aux fonctionnalités personnalisées de la plateforme.

Le système doit permettre aux clients de créer un compte utilisateur avec email et mot de passe.
Les utilisateurs doivent pouvoir se connecter et se déconnecter de leur compte.
Un utilisateur doit pouvoir réinitialiser son mot de passe en cas d'oubli.

## 2. Catalogue Produits
En tant que client, je veux parcourir le catalogue de produits pour découvrir les articles disponibles.

Le système doit afficher une liste de produits avec photos, descriptions et prix.
Les utilisateurs doivent pouvoir filtrer les produits par catégorie, prix et marque.
Un système de recherche doit permettre de trouver des produits par mots-clés.

## 3. Panier d'Achat
En tant que client, je veux ajouter des produits à mon panier pour préparer ma commande.

Les utilisateurs doivent pouvoir ajouter des produits à leur panier.
Le panier doit afficher le total des articles et le prix total.
Les clients doivent pouvoir modifier les quantités ou supprimer des articles du panier.

## 4. Processus de Commande
En tant que client, je veux finaliser ma commande pour recevoir mes produits.

Un client doit avoir la possibilité de passer commande depuis son panier.
Le système doit collecter les informations de livraison et de facturation.
Un client doit avoir la possibilité de payer en ligne avec une carte bancaire.

## 5. Administration
En tant qu'administrateur, je veux gérer le catalogue pour maintenir l'offre produits à jour.

Les administrateurs doivent gérer le stock et mettre à jour les fiches produits.
Le système doit permettre d'ajouter, modifier ou supprimer des produits.
Les administrateurs doivent pouvoir consulter les commandes et leur statut.

## 6. Sécurité
Le système doit chiffrer les données sensibles des utilisateurs.
Les paiements doivent être sécurisés selon les standards PCI DSS.
Un système d'authentification robuste doit protéger les comptes utilisateurs.`;

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
                onClick={onUseSample}
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