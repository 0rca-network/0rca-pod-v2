'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Code, 
  Eye, 
  Settings as SettingsIcon,
  TestTube,
  Sparkles
} from 'lucide-react';

interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
}

interface Tool {
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  parameters: Parameter[];
  price: number;
  greeting: string;
}

interface CreateToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Tool) => void;
}

export const CreateToolModal: React.FC<CreateToolModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [activeView, setActiveView] = useState<'form' | 'code' | 'preview'>('form');
  const [tool, setTool] = useState<Tool>({
    name: '',
    description: '',
    endpoint: 'http://localhost:80',
    method: 'GET',
    parameters: [],
    price: 0,
    greeting: ''
  });

  const [expandedSections, setExpandedSections] = useState({
    parameters: true,
    response: true
  });

  const parameterTypes = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'object', label: 'Object' },
    { value: 'array', label: 'Array' }
  ];

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const addParameter = () => {
    setTool({
      ...tool,
      parameters: [
        ...tool.parameters,
        { name: '', type: 'string', required: false, description: '' }
      ]
    });
  };

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    const newParameters = [...tool.parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    setTool({ ...tool, parameters: newParameters });
  };

  const removeParameter = (index: number) => {
    setTool({
      ...tool,
      parameters: tool.parameters.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    onSave(tool);
    onClose();
    // Reset form
    setTool({
      name: '',
      description: '',
      endpoint: 'http://localhost:80',
      method: 'GET',
      parameters: [],
      price: 0,
      greeting: ''
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black border border-neutral-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-mint-glow rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Tool</h2>
                <p className="text-sm text-neutral-400">
                  {tool.name || 'Here is the name of the associated Agent'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-neutral-900 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('form')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeView === 'form' 
                      ? 'bg-mint-glow text-black' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Form View
                </button>
                <button
                  onClick={() => setActiveView('code')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeView === 'code' 
                      ? 'bg-mint-glow text-black' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Code View
                </button>
              </div>

              <div className="flex bg-neutral-900 rounded-lg p-1">
                <button className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors">
                  Limit Settings
                </button>
                <button className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
                  <TestTube size={12} />
                  Test
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-mint-glow text-black font-bold rounded-lg hover:bg-mint-glow/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-80 border-r border-neutral-800 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    value={tool.name}
                    onChange={(e) => setTool({ ...tool, name: e.target.value })}
                    className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-mint-glow focus:outline-none text-white"
                    placeholder="Tool name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                    Price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={tool.price}
                      onChange={(e) => setTool({ ...tool, price: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-mint-glow focus:outline-none text-white pr-16"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                      USDC/call
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-neutral-800 rounded border border-neutral-600" />
                  <span className="text-sm text-neutral-400">Set as Trigger</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                    Doc Assistant
                  </label>
                  <p className="text-xs text-neutral-500 mb-3">
                    Input schema or url to create a tool. Enter the URL or schema and let Tars help you complete the configuration
                  </p>
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg min-h-[100px] text-neutral-500 text-sm">
                    Enter configuration details...
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={tool.description}
                    onChange={(e) => setTool({ ...tool, description: e.target.value })}
                    className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-mint-glow focus:outline-none text-white resize-none"
                    rows={4}
                    placeholder="Describe what this tool does..."
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {activeView === 'form' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">API Compile</h3>
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                          Path
                        </label>
                        <div className="flex">
                          <select
                            value={tool.method}
                            onChange={(e) => setTool({ ...tool, method: e.target.value as any })}
                            className="px-4 py-3 bg-neutral-900 border border-neutral-700 border-r-0 rounded-l-lg focus:border-mint-glow focus:outline-none text-white"
                          >
                            {httpMethods.map(method => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={tool.endpoint}
                            onChange={(e) => setTool({ ...tool, endpoint: e.target.value })}
                            className="flex-1 p-3 bg-neutral-900 border border-neutral-700 rounded-r-lg focus:border-mint-glow focus:outline-none text-white"
                            placeholder="/api"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <div className="flex bg-neutral-900 rounded-lg p-1">
                          <span className="px-3 py-1.5 text-xs font-bold text-neutral-400">
                            Use agent authorization
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parameters Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold">Parameters</h4>
                      <button
                        onClick={() => toggleSection('parameters')}
                        className="text-mint-glow hover:text-mint-glow/80"
                      >
                        {expandedSections.parameters ? '−' : '+'}
                      </button>
                    </div>

                    {expandedSections.parameters && (
                      <div className="space-y-4">
                        <div className="flex gap-4 text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 pb-2">
                          <div className="w-8"></div>
                          <div className="flex-1">Query Params</div>
                          <div className="flex-1">Request Headers</div>
                          <div className="flex-1">Path Params</div>
                          <div className="flex-1">Cookie Params</div>
                          <div className="flex-1">Body Params</div>
                        </div>

                        {tool.parameters.map((param, index) => (
                          <div key={index} className="flex gap-4 items-center">
                            <button
                              onClick={() => removeParameter(index)}
                              className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) => updateParameter(index, 'name', e.target.value)}
                              placeholder="Parameter name"
                              className="flex-1 p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-mint-glow focus:outline-none text-white text-sm"
                            />
                            <select
                              value={param.type}
                              onChange={(e) => updateParameter(index, 'type', e.target.value)}
                              className="flex-1 p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-mint-glow focus:outline-none text-white text-sm"
                            >
                              {parameterTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={param.description}
                              onChange={(e) => updateParameter(index, 'description', e.target.value)}
                              placeholder="Description"
                              className="flex-1 p-2 bg-neutral-900 border border-neutral-700 rounded focus:border-mint-glow focus:outline-none text-white text-sm"
                            />
                            <label className="flex items-center gap-2 flex-1">
                              <input
                                type="checkbox"
                                checked={param.required}
                                onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                                className="w-4 h-4 text-mint-glow bg-neutral-900 border-neutral-700 rounded focus:ring-mint-glow"
                              />
                              <span className="text-sm text-neutral-400">Required</span>
                            </label>
                          </div>
                        ))}

                        <button
                          onClick={addParameter}
                          className="flex items-center gap-2 p-3 text-mint-glow hover:bg-mint-glow/10 rounded-lg transition-colors w-full justify-center border border-dashed border-neutral-700"
                        >
                          <Plus size={16} />
                          Add Parameters
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Response Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold">Response</h4>
                      <button
                        onClick={() => toggleSection('response')}
                        className="text-mint-glow hover:text-mint-glow/80"
                      >
                        {expandedSections.response ? '−' : '+'}
                      </button>
                    </div>

                    {expandedSections.response && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-neutral-400">Status Code:</span>
                          <button className="px-3 py-1 bg-neutral-800 text-white rounded text-sm">
                            + Add Status Code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeView === 'code' && (
                <div className="p-8">
                  <div className="bg-neutral-900 rounded-lg p-6 font-mono text-sm">
                    <pre className="text-neutral-300">
{`{
  "name": "${tool.name}",
  "description": "${tool.description}",
  "endpoint": "${tool.endpoint}",
  "method": "${tool.method}",
  "parameters": ${JSON.stringify(tool.parameters, null, 2)},
  "price": ${tool.price}
}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Preview */}
            <div className="w-80 border-l border-neutral-800 p-6 overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-4">Preview</h4>
                <div className="bg-neutral-900 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-mint-glow rounded-lg flex items-center justify-center">
                      <span className="text-black text-sm font-bold">
                        {tool.name.charAt(0).toUpperCase() || 'T'}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-white">{tool.name || 'Tool Name'}</div>
                      <div className="text-xs text-neutral-400">Tool</div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400">
                    {tool.description || 'Tool description will appear here'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-neutral-400 mb-2">Greeting</h5>
                  <input
                    type="text"
                    value={tool.greeting}
                    onChange={(e) => setTool({ ...tool, greeting: e.target.value })}
                    placeholder="Enter a shortcut phrase..."
                    className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-mint-glow focus:outline-none text-white text-sm"
                  />
                </div>

                <div>
                  <h5 className="text-sm font-bold text-neutral-400 mb-2">Shortcuts</h5>
                  <p className="text-xs text-neutral-500 mb-3">No shortcuts added yet</p>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-neutral-400 mb-2">Authentication</h5>
                  <select className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-mint-glow focus:outline-none text-white text-sm">
                    <option>None</option>
                    <option>API Key</option>
                    <option>Bearer Token</option>
                    <option>OAuth</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};