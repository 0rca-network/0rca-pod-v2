import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-neutral-800 rounded" />
    </div>
  );
};

export const AgentDetailSkeleton: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="h-24 md:h-32" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="animate-pulse">
          {/* Back button skeleton */}
          <div className="h-4 bg-neutral-800 rounded w-32 mb-8 lg:mb-12" />
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
            {/* Left Column Skeleton */}
            <div className="xl:col-span-5 space-y-6 lg:space-y-8">
              <div className="aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-neutral-800 rounded-[2rem] lg:rounded-[3rem]" />
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="h-24 lg:h-32 bg-neutral-800 rounded-[1.5rem] lg:rounded-[2rem]" />
                <div className="h-24 lg:h-32 bg-neutral-800 rounded-[1.5rem] lg:rounded-[2rem]" />
              </div>
            </div>
            
            {/* Right Column Skeleton */}
            <div className="xl:col-span-7 space-y-8 lg:space-y-12">
              <div className="space-y-4 lg:space-y-6">
                <div className="flex gap-2 lg:gap-3">
                  <div className="h-8 bg-neutral-800 rounded-full w-20" />
                  <div className="h-8 bg-neutral-800 rounded-full w-32" />
                </div>
                <div className="h-16 lg:h-20 bg-neutral-800 rounded w-3/4" />
                <div className="h-12 lg:h-16 bg-neutral-800 rounded w-full" />
              </div>
              
              {/* Tags skeleton */}
              <div className="flex flex-wrap gap-2 lg:gap-3 py-6 lg:py-8 border-y border-neutral-800">
                <div className="h-8 bg-neutral-800 rounded-xl w-16" />
                <div className="h-8 bg-neutral-800 rounded-xl w-20" />
                <div className="h-8 bg-neutral-800 rounded-xl w-24" />
              </div>
              
              {/* Buttons skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <div className="flex-1 h-14 lg:h-16 bg-neutral-800 rounded-full" />
                <div className="h-14 lg:h-16 w-full sm:w-32 bg-neutral-800 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};