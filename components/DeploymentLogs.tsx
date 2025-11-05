"use client"

import { useState, useEffect } from 'react'

interface DeploymentLogsProps {
  agentId: string
  onClose: () => void
}

export function DeploymentLogs({ agentId, onClose }: DeploymentLogsProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState('pending')
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    'Fetching repository packages...',
    'Setting up build environment...',
    'Installing dependencies...',
    'Building application...',
    'Configuring domain...',
    'Deploying to production...',
    'Deployment complete!'
  ]

  useEffect(() => {
    // Mock deployment process
    const mockDeployment = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        setCurrentStep(i)
        setLogs(prev => [...prev, `✓ ${steps[i]}`])
        
        if (i === steps.length - 1) {
          setStatus('success')
        }
      }
    }

    mockDeployment()
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">Deployment Status</h2>
          {status === 'success' && (
            <button onClick={onClose} className="text-neutral-400 hover:text-white">×</button>
          )}
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              status === 'pending' ? 'bg-yellow-500 animate-pulse' : 
              status === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-white font-medium">
              {status === 'pending' ? 'Deploying...' : 
               status === 'success' ? 'Deployment Successful' : 'Deployment Failed'}
            </span>
          </div>

          {/* Progress */}
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Build Logs */}
          <div className="bg-black rounded p-4 h-64 overflow-y-auto">
            <div className="text-green-400 font-mono text-sm space-y-1">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {status === 'pending' && currentStep < steps.length && (
                <div className="text-yellow-400 animate-pulse">
                  → {steps[currentStep]}
                </div>
              )}
            </div>
          </div>

          {/* Deployment Summary */}
          {status === 'success' && (
            <div className="bg-neutral-700 rounded p-4">
              <h3 className="text-white font-semibold mb-2">Deployment Summary</h3>
              <div className="text-neutral-300 text-sm space-y-1">
                <div>• Build completed successfully</div>
                <div>• Domain configured and SSL enabled</div>
                <div>• Agent deployed to production</div>
                <div>• Health checks passed</div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 transition-colors"
            >
              View Agent
            </button>
          )}
        </div>
      </div>
    </div>
  )
}