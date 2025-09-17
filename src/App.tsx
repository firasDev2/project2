import React, { useState } from 'react';
import { Header } from './components/Header';
import { DocumentUpload } from './components/DocumentUpload';
import { RequirementsGrid } from './components/RequirementsGrid';
import { ChatPanel } from './components/ChatPanel';
import { SettingsModal } from './components/SettingsModal';
import { UserStory, RequirementElement, Project } from './types/requirements';
import { extractRequirements } from './utils/mockExtraction';
import { MessageSquare } from 'lucide-react';

function App() {
  const [project, setProject] = useState<Project>({
    id: 'proj-1',
    name: 'E-commerce Platform Requirements',
    description: 'Requirements extracted from specification document',
    userStories: [],
    extractionStatus: 'idle'
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<RequirementElement | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleDocumentUpload = async (content: string) => {
    setProject(prev => ({ ...prev, extractionStatus: 'processing' }));
    
    try {
      const extractedStories = await extractRequirements(content);
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

  const handleUpdateUserStory = (updatedStory: UserStory) => {
    setProject(prev => ({
      ...prev,
      userStories: prev.userStories.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      )
    }));
  };

  const handleDeleteUserStory = (userStoryId: string) => {
    setProject(prev => ({
      ...prev,
      userStories: prev.userStories.filter(story => story.id !== userStoryId)
    }));
  };

  const handleSelectElement = (element: RequirementElement) => {
    setSelectedElement(element);
    setIsChatOpen(true);
  };

  const handleReExtract = () => {
    setProject(prev => ({ ...prev, extractionStatus: 'processing' }));
    // Simulate re-extraction
    setTimeout(() => {
      setProject(prev => ({ ...prev, extractionStatus: 'completed' }));
    }, 2000);
  };

  const handleExport = () => {
    const exportData = {
      project: project.name,
      userStories: project.userStories.map(story => ({
        id: story.id,
        title: story.title,
        description: `As a ${story.role}, I want ${story.feature} so that ${story.benefit}`,
        acceptanceCriteria: story.elements
          .filter(el => el.category === 'acceptance-criteria')
          .map(el => el.content),
        priority: story.priority,
        modules: story.modules
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-requirements.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadToJira = () => {
    // Simulate Jira upload
    const jiraData = project.userStories.map(story => ({
      summary: story.title,
      description: `As a ${story.role}, I want ${story.feature} so that ${story.benefit}`,
      issueType: 'Story',
      priority: story.priority,
      acceptanceCriteria: story.elements
        .filter(el => el.category === 'acceptance-criteria')
        .map(el => el.content)
        .join('\n'),
      components: story.modules
    }));

    console.log('Uploading to Jira:', jiraData);
    alert(`Successfully uploaded ${project.userStories.length} user stories to Jira!`);
  };

  const validatedCount = project.userStories.filter(story => story.status === 'validated').length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        projectName={project.name}
        onReExtract={handleReExtract}
        onExport={handleExport}
        onUploadToJira={handleUploadToJira}
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
          />
        ) : (
          <>
            <RequirementsGrid
              userStories={project.userStories}
              onUpdateUserStory={handleUpdateUserStory}
             onDeleteUserStory={handleDeleteUserStory}
              onSelectElement={handleSelectElement}
            />

            <ChatPanel
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              selectedElement={selectedElement}
            />
          </>
        )}

        {/* Chat Toggle Button */}
        {project.userStories.length > 0 && !isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Footer */}
      {project.userStories.length > 0 && (
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Progress: {validatedCount} of {project.userStories.length} requirements validated
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(validatedCount / project.userStories.length) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => {
                const updatedStories = project.userStories.map(story => ({
                  ...story,
                  status: 'validated' as const
                }));
                setProject(prev => ({ ...prev, userStories: updatedStories }));
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              ✓ Mark All as Validated
            </button>
          </div>
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