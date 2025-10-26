import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Job {
  id: string;
  agentId: string;
  name: string;
  status: string;
  date: string;
}

interface JobHistorySidebarProps {
  jobs: Job[];
  agentId: string;
}

export const JobHistorySidebar: React.FC<JobHistorySidebarProps> = ({ jobs, agentId }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      demo: 'bg-orange-500 text-white',
      hiring: 'bg-purple-600 text-white',
      completed: 'bg-green-600 text-white',
    };
    return styles[status.toLowerCase() as keyof typeof styles] || 'bg-neutral-600 text-white';
  };

  return (
    <aside className="w-80 bg-neutral-900 border-r border-neutral-800 overflow-y-auto">
      <div className="p-4 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="w-full px-3 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-[#63f2d2] focus:outline-none"
        />

        <div className="space-y-2">
          <label className="text-neutral-400 text-xs uppercase font-semibold">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="demo">Demo</option>
            <option value="hiring">Hiring</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Link key={job.id} href={`/pod/agents/${agentId}/jobs/${job.id}`}>
              <div className={`p-3 rounded-lg cursor-pointer transition-colors ${
                router.query.jobId === job.id ? 'bg-[#63f2d2]/20 border border-[#63f2d2]' : 'bg-neutral-800 hover:bg-neutral-700'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-white font-medium text-sm">{job.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <span className="text-neutral-400 text-xs">{job.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
