import React, { useState } from 'react';
import { X, Palette, Brain, FileText, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('extraction');
  const [settings, setSettings] = useState({
    llmModel: 'gpt-4',
    extractionMode: 'comprehensive',
    highlightColors: {
      'acceptance-criteria': '#10B981',
      'dependencies': '#F59E0B',
      'technical-details': '#6B7280',
      'security': '#EC4899',
      'testing': '#EAB308'
    },
    autoValidation: false,
    confidenceThreshold: 0.8,
    exportFormat: 'json'
  });

  if (!isOpen) return null;

  const tabs = [
    { id: 'extraction', label: 'Extraction', icon: Brain },
    { id: 'highlighting', label: 'Highlighting', icon: Palette },
    { id: 'export', label: 'Export', icon: FileText },
    { id: 'advanced', label: 'Advanced', icon: Zap }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>
            <nav className="p-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label} Settings
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'extraction' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LLM Model
                    </label>
                    <select
                      value={settings.llmModel}
                      onChange={(e) => setSettings(prev => ({ ...prev, llmModel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="gpt-4">GPT-4 (Recommended)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                      <option value="gemini-pro">Gemini Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extraction Mode
                    </label>
                    <div className="space-y-2">
                      {['comprehensive', 'focused', 'quick'].map(mode => (
                        <label key={mode} className="flex items-center">
                          <input
                            type="radio"
                            name="extractionMode"
                            value={mode}
                            checked={settings.extractionMode === mode}
                            onChange={(e) => setSettings(prev => ({ ...prev, extractionMode: e.target.value }))}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Threshold: {settings.confidenceThreshold}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.05"
                      value={settings.confidenceThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Less Strict</span>
                      <span>More Strict</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'highlighting' && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Customize colors used for highlighting different requirement categories in Word documents.
                  </p>
                  
                  {Object.entries(settings.highlightColors).map(([category, color]) => (
                    <div key={category} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {category.replace('-', ' ')}
                      </label>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            highlightColors: {
                              ...prev.highlightColors,
                              [category]: e.target.value
                            }
                          }))}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'export' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Export Format
                    </label>
                    <select
                      value={settings.exportFormat}
                      onChange={(e) => setSettings(prev => ({ ...prev, exportFormat: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="pdf">PDF Report</option>
                    </select>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Jira Integration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jira Server URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourcompany.atlassian.net"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Key
                        </label>
                        <input
                          type="text"
                          placeholder="PROJ"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Token
                        </label>
                        <input
                          type="password"
                          placeholder="Your Jira API token"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-validation</label>
                      <p className="text-xs text-gray-500">Automatically validate high-confidence extractions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoValidation}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoValidation: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Quality Checks</h4>
                    <div className="space-y-2">
                      {[
                        'Flag vague terms (etc., should, maybe)',
                        'Check for missing acceptance criteria',
                        'Validate user story format',
                        'Detect duplicate requirements'
                      ].map((check, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{check}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};