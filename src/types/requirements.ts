export interface RequirementElement {
  id: string;
  category: 'user-story' | 'business-need' | 'business-context' | 'modules' | 
           'technical-details' | 'dependencies' | 'out-of-scope' | 
           'acceptance-criteria' | 'testing' | 'security' | 'deployment' | 'definition-of-done';
  content: string;
  sourceText?: string;
  confidence?: number;
  validated?: boolean;
}

export interface UserStory {
  id: string;
  title: string;
  role: string;
  feature: string;
  benefit: string;
  elements: RequirementElement[];
  priority: 'high' | 'medium' | 'low';
  status: 'extracted' | 'validated' | 'completed';
  modules: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  userStories: UserStory[];
  extractionStatus: 'idle' | 'processing' | 'completed';
}