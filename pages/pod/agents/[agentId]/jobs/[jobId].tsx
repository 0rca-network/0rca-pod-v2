import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { JobHistorySidebar } from '@/components/JobHistorySidebar';
import { JobDetail } from '@/components/JobDetail';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { jobs, agents } from '@/lib/dummy-data';

interface Job {
  id: string;
  agentId: string;
  name: string;
  status: string;
  date: string;
  txnId: string;
  inputHash: string;
  resultHash: string;
  input: string;
  result: string;
}

interface Agent {
  id: string;
  name: string;
}

interface JobDetailPageProps {
  job: Job;
  agent: Agent;
  allJobs: Job[];
}

export default function JobDetailPage({ job, agent, allJobs }: JobDetailPageProps) {
  if (!job || !agent) return <div className="text-white">Loading...</div>;

  const breadcrumbs = [
    { label: 'Pods', href: '/pod' },
    { label: agent.name, href: `/pod/agents/${agent.id}` },
    { label: 'Jobs' },
  ];

  return (
    <div className="flex h-full -m-6">
      <JobHistorySidebar jobs={allJobs} agentId={agent.id} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <Breadcrumbs items={breadcrumbs} />
          <JobDetail job={job} />
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = jobs.map((job) => ({
    params: { agentId: job.agentId, jobId: job.id },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const job = jobs.find((j) => j.id === params?.jobId);
  const agent = agents.find((a) => a.id === params?.agentId);
  const allJobs = jobs.filter((j) => j.agentId === params?.agentId);

  return {
    props: {
      job: job || null,
      agent: agent || null,
      allJobs,
    },
  };
};
