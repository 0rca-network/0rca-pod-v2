import React, { useState } from 'react';

interface Job {
  id: string;
  name: string;
  txnId: string;
  inputHash: string;
  resultHash: string;
  date: string;
  status: string;
  input: string;
  result: string;
}

interface JobDetailProps {
  job: Job;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job }) => {
  const [inputOpen, setInputOpen] = useState(true);
  const [resultOpen, setResultOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">{job.name}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-neutral-400 text-sm">Job ID</p>
            <p className="text-white font-mono">{job.id}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-sm">Transaction ID</p>
            <p className="text-white font-mono">{job.txnId}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-sm">Input Hash</p>
            <p className="text-white font-mono">{job.inputHash}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-sm">Result Hash</p>
            <p className="text-white font-mono">{job.resultHash}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-sm">Date</p>
            <p className="text-white">{job.date}</p>
          </div>
          <div>
            <p className="text-neutral-400 text-sm">Status</p>
            <p className="text-white">{job.status}</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl overflow-hidden">
        <button
          onClick={() => setInputOpen(!inputOpen)}
          className="w-full flex items-center justify-between p-6 text-left border-b border-neutral-800"
        >
          <span className="text-xl font-semibold text-white">Input</span>
          <svg className={`w-6 h-6 text-white transition-transform ${inputOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {inputOpen && (
          <div className="p-6">
            <pre className="text-neutral-300 font-mono text-sm bg-black/50 p-4 rounded overflow-x-auto">
              {JSON.stringify(JSON.parse(job.input), null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-neutral-900/50 backdrop-blur-lg rounded-2xl overflow-hidden">
        <button
          onClick={() => setResultOpen(!resultOpen)}
          className="w-full flex items-center justify-between p-6 text-left border-b border-neutral-800"
        >
          <span className="text-xl font-semibold text-white">Result</span>
          <svg className={`w-6 h-6 text-white transition-transform ${resultOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {resultOpen && (
          <div className="p-6">
            <pre className="text-neutral-300 font-mono text-sm bg-black/50 p-4 rounded overflow-x-auto">
              {JSON.stringify(JSON.parse(job.result), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
