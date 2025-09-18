import React, { useState } from 'react';
import { Send, X, MessageSquare, FileText, AlertCircle, FileType, Bot, Sparkles, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { RequirementElement, UserStory } from '../types/requirements';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userStoryContext?: UserStory;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedElement?: RequirementElement;
  selectedUserStory?: UserStory;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  selectedElement,
  selectedUserStory
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: selectedUserStory 
        ? "Hi! I'm ready to help you correct and refine this user story. What would you like to improve or change?"
        : "Hi! I'm here to help you validate and refine your requirements. Ask me about any extracted requirements or request corrections.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  const handleHighlightInWord = (messageContent: string) => {
    // In a real implementation, this would call the Word COM API
    console.log('Highlighting in Word:', messageContent);
    // Simulate Word highlighting
    alert(`Highlighting "${messageContent.substring(0, 50)}..." in Word document`);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Add user story context if we have one
    if (selectedUserStory) {
      userMessage.userStoryContext = selectedUserStory;
    }

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      let responses;
      
      if (selectedUserStory) {
        responses = [
          `I understand you want to correct "${selectedUserStory.title}". Based on your feedback, I can help you refine the user story structure, acceptance criteria, or any other elements. What specific changes would you like to make?`,
          `Got it! I'll help you improve this user story. I can see it currently has ${selectedUserStory.elements.length} requirements. What aspects need correction?`,
          `I'm ready to help you correct this ${selectedUserStory.priority} priority story. Would you like to modify the story description, acceptance criteria, or technical details?`,
          `I can help you refine this user story. Based on your input, I'll suggest specific improvements to make it clearer and more actionable.`,
          `Perfect! I'll help you correct and improve this user story. What changes do you have in mind?`
        ];
      } else {
        responses = [
          "I understand your concern. Let me analyze that requirement and suggest improvements.",
          "That's a good point. Based on the context, I think we should reclassify this as a dependency rather than acceptance criteria.",
          "I can help you break this down into more specific, testable acceptance criteria.",
          "This requirement seems to overlap with another one. Should we consolidate them?",
          "I notice this requirement might be missing some technical details. Would you like me to suggest what should be added?"
        ];
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  // Helper function to get story summary
  const getStorySummary = (story: UserStory) => {
    const fullStory = `As a ${story.role}, I want ${story.feature} so that ${story.benefit}`;
    const sentences = [
      fullStory,
      ...story.elements
        .filter(el => el.category === 'acceptance-criteria')
        .slice(0, 4)
        .map(el => el.content)
    ];
    return sentences;
  };

  // Story Context Component
  const StoryContextCard: React.FC<{ story: UserStory; isExpanded: boolean; onToggle: () => void; isInMessage?: boolean }> = ({ 
    story, 
    isExpanded, 
    onToggle, 
    isInMessage = false 
  }) => {
    const sentences = getStorySummary(story);
    const displaySentences = isExpanded ? sentences : sentences.slice(0, 1);
    
    return (
      <div className={`border rounded-lg transition-all duration-200 ${
        isInMessage 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
      }`}>
        <button
          onClick={onToggle}
          className={`w-full p-3 text-left transition-colors ${
            isInMessage 
              ? 'hover:bg-blue-100' 
              : 'hover:bg-purple-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit3 className={`w-4 h-4 ${isInMessage ? 'text-blue-600' : 'text-purple-600'}`} />
              <span className={`font-medium text-sm ${
                isInMessage ? 'text-blue-900' : 'text-purple-900'
              }`}>
                {story.title}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className={`w-4 h-4 ${isInMessage ? 'text-blue-600' : 'text-purple-600'}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${isInMessage ? 'text-blue-600' : 'text-purple-600'}`} />
            )}
          </div>
        </button>
        
        <div className={`px-3 pb-3 ${isExpanded ? 'max-h-40 overflow-y-auto' : ''}`}>
          <div className="space-y-2">
            {displaySentences.map((sentence, index) => (
              <p key={index} className={`text-xs ${
                isInMessage ? 'text-blue-700' : 'text-purple-700'
              } ${index === 0 ? 'font-medium' : ''}`}>
                {index === 0 ? sentence : `• ${sentence}`}
              </p>
            ))}
            {!isExpanded && sentences.length > 1 && (
              <p className={`text-xs ${isInMessage ? 'text-blue-500' : 'text-purple-500'} italic`}>
                +{sentences.length - 1} more requirements...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedUserStory ? (
              <>
                <div className="p-1.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                  <Edit3 className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Story Correction</h3>
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Selected Element Context */}
      {selectedElement && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 text-blue-600 mt-1" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Selected Requirement</h4>
              <p className="text-sm text-blue-700 mb-2">{selectedElement.content}</p>
              {selectedElement.sourceText && (
                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  <strong>Source:</strong> {selectedElement.sourceText}
                </div>
              )}
              {selectedElement.confidence && selectedElement.confidence < 0.8 && (
                <div className="flex items-center space-x-1 mt-2 text-xs text-amber-700">
                  <AlertCircle className="w-3 h-3" />
                  <span>Low confidence extraction</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-xs">
              {/* User Story Context in Message */}
              {message.userStoryContext && (
                <div className="mb-2">
                  <StoryContextCard 
                    story={message.userStoryContext}
                    isExpanded={false}
                    onToggle={() => {}}
                    isInMessage={true}
                  />
                </div>
              )}
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.type === 'assistant' && (
                <button
                  onClick={() => handleHighlightInWord(message.content)}
                  className="mt-2 inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                >
                  <FileType className="w-3 h-3 mr-1" />
                  Highlight in Word
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        {/* Story Context Above Input */}
        {selectedUserStory && (
          <div className="mb-3">
            <StoryContextCard 
              story={selectedUserStory}
              isExpanded={isContextExpanded}
              onToggle={() => setIsContextExpanded(!isContextExpanded)}
            />
          </div>
        )}
        
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedUserStory ? "Describe what you'd like to correct in this user story..." : "Ask about requirements, request corrections..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};