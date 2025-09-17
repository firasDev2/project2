import React from 'react';
import { RequirementCard } from './RequirementCard';
import { UserStory, RequirementElement } from '../types/requirements';

interface RequirementsGridProps {
  userStories: UserStory[];
  onUpdateUserStory: (userStory: UserStory) => void;
  onDeleteUserStory: (userStoryId: string) => void;
  onSelectElement: (element: RequirementElement) => void;
}

export const RequirementsGrid: React.FC<RequirementsGridProps> = ({
  userStories,
  onUpdateUserStory,
  onDeleteUserStory,
  onSelectElement
}) => {
  if (userStories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requirements extracted yet</h3>
          <p className="text-gray-500">Upload a document to get started with requirements extraction</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {userStories.map(userStory => (
            <RequirementCard
              key={userStory.id}
              userStory={userStory}
              onUpdate={onUpdateUserStory}
              onDelete={onDeleteUserStory}
              onSelectElement={onSelectElement}
            />
          ))}
        </div>
      </div>
    </div>
  );
};