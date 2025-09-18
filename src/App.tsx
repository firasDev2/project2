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
