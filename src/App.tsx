import React, { useState } from 'react';
import { Header } from './components/Header';
import { DocumentUpload } from './components/DocumentUpload';
import { RequirementsGrid } from './components/RequirementsGrid';
import { ChatPanel } from './components/ChatPanel';
import { SettingsModal } from './components/SettingsModal';
import { UserStory, RequirementElement, Project } from './types/requirements';
import { extractRequirementsStream } from './utils/mockExtraction'; // 👈 streaming version
import { MessageSquare } from 'lucide-react';

function App() {
  const [project, setProject] = useState<Project>({
    id: 'proj-1',
    name: 'E-commerce Platform Requirements',
    description: 'Requirements extracted from specification document',
    userStories: [],
    extractionStatus: 'idle'
  });

  const [llmThinking, setLlmThinking] = useState(""); // 👈 NEW
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<RequirementElement | undefined>();
  const [selectedUserStory, setSelectedUserStory] = useState<UserStory | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

const handleDocumentUpload = async (content: string) => {
  setProject(prev => ({ ...prev, extractionStatus: 'processing' }));
  setLlmThinking(""); // Reset the thinking state

  try {
    const extractedStories = await extractRequirementsStream(content, (token: string) => {
      setLlmThinking(prev => prev + token); // Update the thinking state with each token
    });

    setProject(prev => ({
      ...prev,
      userStories: extractedStories,
      extractionStatus: 'completed'
    }));
  } catch (error) {
    console.error('Extraction failed:', error);
    setProject(prev => ({ ...prev, extractionStatus: 'idle' }));
  }
};

  const handleSampleData = () => {
    setProject(prev => ({ ...prev, extractionStatus: 'processing' }));
    setLlmThinking("Analyzing sample e-commerce requirements...\nExtracting user stories...\nProcessing functional requirements...\n");
    
    // Simulate processing time
    setTimeout(() => {
      const sampleStories = [
        {
          id: 'story-1',
          title: 'En tant qu\'utilisateur, je veux créer un compte pour accéder aux fonctionnalités personnalisées',
          role: 'utilisateur',
          feature: 'créer un compte',
          benefit: 'accéder aux fonctionnalités personnalisées',
          elements: [{
            id: 'element-1',
            category: 'user-story' as const,
            content: 'En tant qu\'utilisateur, je veux créer un compte pour accéder aux fonctionnalités personnalisées',
            sourceText: 'Le système doit permettre aux utilisateurs de créer un compte avec email et mot de passe',
            confidence: 1,
            validated: false,
          }],
          priority: 'high' as const,
          status: 'extracted' as const,
          modules: ['Authentication'],
        },
        {
          id: 'story-2',
          title: 'En tant qu\'utilisateur, je veux parcourir le catalogue de produits pour trouver des articles',
          role: 'utilisateur',
          feature: 'parcourir le catalogue',
          benefit: 'trouver des articles',
          elements: [{
            id: 'element-2',
            category: 'user-story' as const,
            content: 'En tant qu\'utilisateur, je veux parcourir le catalogue de produits pour trouver des articles',
            sourceText: 'Le catalogue doit afficher tous les produits disponibles avec filtres et recherche',
            confidence: 1,
            validated: false,
          }],
          priority: 'high' as const,
          status: 'extracted' as const,
          modules: ['Product Catalog'],
        },
        {
          id: 'story-3',
          title: 'En tant qu\'utilisateur, je veux ajouter des produits au panier pour les acheter plus tard',
          role: 'utilisateur',
          feature: 'ajouter au panier',
          benefit: 'acheter plus tard',
          elements: [{
            id: 'element-3',
            category: 'user-story' as const,
            content: 'En tant qu\'utilisateur, je veux ajouter des produits au panier pour les acheter plus tard',
            sourceText: 'Le système doit permettre d\'ajouter, modifier et supprimer des articles du panier',
            confidence: 1,
            validated: false,
          }],
          priority: 'medium' as const,
          status: 'extracted' as const,
          modules: ['Shopping Cart'],
        }
      ];
      
      setProject(prev => ({
        ...prev,
        userStories: sampleStories,
        extractionStatus: 'completed'
      }));
    }, 2000);
  };
  

  const validatedCount = project.userStories.filter(story => story.status === 'validated').length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        projectName={project.name}
        onReExtract={() => setProject(prev => ({ ...prev, extractionStatus: 'processing' }))}
        onExport={() => {}}
        onUploadToJira={() => {}}
        onSettings={() => setIsSettingsOpen(true)}
        extractionStatus={project.extractionStatus}
        validatedCount={validatedCount}
        totalCount={project.userStories.length}
      />

      <div className="flex-1 flex overflow-hidden">
        {project.userStories.length === 0 ? (
          <DocumentUpload
            onUpload={handleDocumentUpload}
            onUseSample={handleSampleData}
            isProcessing={project.extractionStatus === 'processing'}
            llmThinking={llmThinking} // 👈 pass live text
          />
        ) : (
          <>
            <RequirementsGrid
              userStories={project.userStories}
              onUpdateUserStory={() => {}}
              onDeleteUserStory={() => {}}
              onSelectElement={() => {}}
              onOpenAIChat={() => {}}
            />

            <ChatPanel
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              selectedElement={selectedElement}
              selectedUserStory={selectedUserStory}
            />
          </>
        )}

        {project.userStories.length > 0 && !isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>

      {project.userStories.length > 0 && (
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          {/* unchanged */}
        </footer>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
