import React from 'react';
import { createPortal } from 'react-dom';

interface HiringProgressModalProps {
  isOpen: boolean;
  currentStage: string;
  stages: Array<{ id: string; label: string; status: 'pending' | 'active' | 'complete' | 'error' }>;
  error?: string;
  onClose?: () => void;
}

export const HiringProgressModal: React.FC<HiringProgressModalProps> = ({
  isOpen,
  currentStage,
  stages,
  error,
  onClose
}) => {
  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Hiring Agent</h2>
          <p className="text-neutral-400 text-sm">Please wait while we process your request</p>
        </div>

        <div className="space-y-4 mb-8">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                stage.status === 'complete' 
                  ? 'bg-mint-glow/20 border-mint-glow' 
                  : stage.status === 'active'
                  ? 'bg-blue-500/20 border-blue-500'
                  : stage.status === 'error'
                  ? 'bg-red-500/20 border-red-500'
                  : 'bg-neutral-800 border-neutral-700'
              }`}>
                {stage.status === 'complete' ? (
                  <svg className="w-5 h-5 text-mint-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : stage.status === 'active' ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : stage.status === 'error' ? (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <span className="text-neutral-600 text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium transition-colors ${
                  stage.status === 'complete' 
                    ? 'text-mint-glow' 
                    : stage.status === 'active'
                    ? 'text-white'
                    : stage.status === 'error'
                    ? 'text-red-500'
                    : 'text-neutral-500'
                }`}>
                  {stage.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {(error || stages.every(s => s.status === 'complete')) && onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 bg-mint-glow text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {error ? 'Close' : 'View Job'}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};
