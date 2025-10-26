import React, { useState } from 'react';

interface DemoInputModalProps {
  agentName: string;
  onClose: () => void;
  onSubmit: (input: any) => void;
}

export const DemoInputModal: React.FC<DemoInputModalProps> = ({ agentName, onClose, onSubmit }) => {
  const [infoOpen, setInfoOpen] = useState(true);
  const [inputOpen, setInputOpen] = useState(true);
  const [formData, setFormData] = useState({ dataset: '', metrics: '' });

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">New {agentName} Demo</h2>
            <button onClick={onClose} className="text-neutral-600 hover:text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="border border-neutral-200 rounded-lg">
            <button
              onClick={() => setInfoOpen(!infoOpen)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-semibold text-black">Information</span>
              <svg className={`w-5 h-5 transition-transform ${infoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {infoOpen && (
              <div className="px-4 pb-4 text-neutral-800">
                <p>This is a free demo of {agentName}. You can test the agent with sample data before hiring.</p>
              </div>
            )}
          </div>

          <div className="border border-neutral-200 rounded-lg">
            <button
              onClick={() => setInputOpen(!inputOpen)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-semibold text-black">Input</span>
              <svg className={`w-5 h-5 transition-transform ${inputOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {inputOpen && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Dataset</label>
                  <input
                    type="text"
                    value={formData.dataset}
                    onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-black"
                    placeholder="Enter dataset name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Metrics</label>
                  <input
                    type="text"
                    value={formData.metrics}
                    onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-black"
                    placeholder="Enter metrics"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={() => setFormData({ dataset: '', metrics: '' })}
            className="px-4 py-2 text-neutral-600 hover:text-black"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            Run Demo
          </button>
        </div>
      </div>
    </div>
  );
};
