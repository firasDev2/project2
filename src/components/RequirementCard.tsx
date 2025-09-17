import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X, AlertTriangle, Trash2, Edit3 } from 'lucide-react';
import { UserStory, RequirementElement } from '../types/requirements';

interface RequirementCardProps {
  userStory: UserStory;
  onUpdate: (userStory: UserStory) => void;
  onDelete: (userStoryId: string) => void;
  onSelectElement: (element: RequirementElement) => void;
}

const categoryColors = {
  'user-story': 'bg-blue-100 text-blue-800',
  'business-need': 'bg-purple-100 text-purple-800',
  'business-context': 'bg-indigo-100 text-indigo-800',
  'modules': 'bg-cyan-100 text-cyan-800',
  'technical-details': 'bg-gray-100 text-gray-800',
  'dependencies': 'bg-orange-100 text-orange-800',
  'out-of-scope': 'bg-red-100 text-red-800',
  'acceptance-criteria': 'bg-green-100 text-green-800',
  'testing': 'bg-yellow-100 text-yellow-800',
  'security': 'bg-pink-100 text-pink-800',
  'deployment': 'bg-teal-100 text-teal-800',
  'definition-of-done': 'bg-emerald-100 text-emerald-800'
};

const categoryLabels = {
  'user-story': 'Story',
  'business-need': 'Business Need',
  'business-context': 'Context',
  'modules': 'Modules',
  'technical-details': 'Technical',
  'dependencies': 'Dependencies',
  'out-of-scope': 'Out of Scope',
  'acceptance-criteria': 'Acceptance',
  'testing': 'Testing',
  'security': 'Security',
  'deployment': 'Deployment',
  'definition-of-done': 'Definition of Done'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

export const RequirementCard: React.FC<RequirementCardProps> = ({
  userStory,
  onUpdate,
  onDelete,
  onSelectElement
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (editingField) {
      const updatedStory = { ...userStory };
      if (editingField === 'title') {
        updatedStory.title = editValue;
      } else if (editingField === 'role') {
        updatedStory.role = editValue;
      } else if (editingField === 'feature') {
        updatedStory.feature = editValue;
      } else if (editingField === 'benefit') {
        updatedStory.benefit = editValue;
      }
      onUpdate(updatedStory);
    }
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleDelete = () => {
    onDelete(userStory.id);
    setShowDeleteConfirm(false);
  };

  const getElementsByCategory = (category: RequirementElement['category']) => {
    return userStory.elements.filter(el => el.category === category);
  };

  const hasQualityIssues = userStory.elements.some(el => 
    el.content.toLowerCase().includes('etc') || 
    el.content.toLowerCase().includes('should') ||
    el.content.toLowerCase().includes('maybe')
  );

  const EditableText: React.FC<{
    value: string;
    field: string;
    className?: string;
    placeholder?: string;
   inline?: boolean;
  }> = ({ value, field, className = '', placeholder }) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
       <div className="inline-flex items-center space-x-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
           className={`px-2 py-1 border-2 border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[120px] ${className}`}
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <button 
            onClick={handleSave} 
            className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title="Save (Enter)"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCancel} 
            className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleEdit(field, value)}
       className={`cursor-text hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent rounded px-2 py-1 transition-all duration-200 group inline-block ${className}`}
        title="Click to edit"
      >
        <span className="group-hover:text-blue-700 transition-colors">
          {value || placeholder}
        </span>
        <Edit3 className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 inline ml-2 transition-opacity" />
      </div>
    );
  };

  const EditablePriority: React.FC = () => {
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const [priorityValue, setPriorityValue] = useState(userStory.priority);

    const handlePriorityChange = (newPriority: 'high' | 'medium' | 'low') => {
      setPriorityValue(newPriority);
      onUpdate({ ...userStory, priority: newPriority });
      setIsEditingPriority(false);
    };

    if (isEditingPriority) {
      return (
        <div className="relative">
          <div className="absolute top-0 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[120px]">
            {(['high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityChange(priority)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors capitalize ${
                  priority === priorityValue
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setIsEditingPriority(false)}
          />
        </div>
      );
    }

    return (
      <button
        onClick={() => setIsEditingPriority(true)}
        className={`px-2 py-1 text-xs font-medium rounded-full border transition-all duration-200 hover:shadow-md ${priorityColors[userStory.priority]} hover:scale-105`}
        title="Click to change priority"
      >
        {userStory.priority}
      </button>
    );
  };
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-xl ${
        isHovered ? 'border-blue-200 shadow-lg' : 'border-gray-200'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Header with Priority and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
           <EditablePriority />
            {hasQualityIssues && (
              <AlertTriangle className="w-4 h-4 text-amber-500" title="Quality issues detected" />
            )}
          </div>
          
          {/* Creative Action Area - Appears on Hover */}
          <div className={`flex items-center space-x-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {/* Delete with Confirmation */}
            {showDeleteConfirm ? (
              <div className="flex items-center space-x-1 bg-red-50 rounded-full px-2 py-1">
                <span className="text-xs text-red-700 font-medium">Delete?</span>
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  title="Confirm Delete"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full transition-colors"
                title="Delete Story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Editable Title */}
        <div className="mb-4">
          <EditableText
            value={userStory.title}
            field="title"
            className="text-lg font-semibold text-gray-900 w-full"
            placeholder="Enter story title..."
          />
        </div>

        {/* Editable User Story Format */}
        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <div className="flex flex-wrap items-center gap-1">
            <span>As a </span>
            <EditableText
              value={userStory.role}
              field="role"
              className="font-medium text-gray-800 inline-block min-w-[60px]"
              placeholder="role"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span>I want </span>
            <EditableText
              value={userStory.feature}
              field="feature"
              className="font-medium text-gray-800 inline-block min-w-[100px]"
              placeholder="feature description"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span>So that </span>
            <EditableText
              value={userStory.benefit}
              field="benefit"
              className="font-medium text-gray-800 inline-block min-w-[100px]"
              placeholder="benefit description"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {userStory.modules.map((module, index) => (
            <span key={index} className={categoryColors.modules + ' px-2 py-1 text-xs font-medium rounded'}>
              📦 {module}
            </span>
          ))}
          {userStory.elements.map(element => (
            <button
              key={element.id}
              onClick={() => onSelectElement(element)}
              className={`${categoryColors[element.category]} px-2 py-1 text-xs font-medium rounded hover:opacity-80 transition-opacity`}
            >
              {categoryLabels[element.category]}
            </button>
          ))}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
            {Object.keys(categoryLabels).map(category => {
              const elements = getElementsByCategory(category as RequirementElement['category']);
              if (elements.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${categoryColors[category as keyof typeof categoryColors].split(' ')[0]}`} />
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h4>
                  <div className="pl-5 space-y-1">
                    {elements.map(element => (
                      <div key={element.id} className="text-sm text-gray-700">
                        {category === 'acceptance-criteria' ? (
                          <div className="flex items-start space-x-2">
                            <input type="checkbox" className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            <span>{element.content}</span>
                          </div>
                        ) : (
                          <p>{element.content}</p>
                        )}
                        {element.confidence && element.confidence < 0.8 && (
                          <span className="text-xs text-amber-600 ml-2">(Low confidence)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {userStory.status === 'validated' ? '✅ Validated' : '⏳ Pending validation'}
          </span>
          {userStory.status !== 'validated' && (
            <button
              onClick={() => onUpdate({ ...userStory, status: 'validated' })}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
            >
              Mark as validated
            </button>
          )}
        </div>
      </div>
    </div>
  );
};