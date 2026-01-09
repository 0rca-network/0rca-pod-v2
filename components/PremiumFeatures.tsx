'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, Shield, Globe, Code } from 'lucide-react';

export const PremiumFeatures: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Configuration',
      description: 'Intelligent suggestions for agent personality and behavior'
    },
    {
      icon: Zap,
      title: 'Real-time Testing',
      description: 'Test your tools and agents instantly with live preview'
    },
    {
      icon: Code,
      title: 'Advanced API Builder',
      description: 'Visual API endpoint configuration with parameter validation'
    },
    {
      icon: Shield,
      title: 'Security & Authentication',
      description: 'Built-in security features and authentication management'
    },
    {
      icon: Globe,
      title: 'Global Deployment',
      description: 'Deploy your agents worldwide with edge computing'
    },
    {
      icon: Sparkles,
      title: 'Premium Analytics',
      description: 'Advanced metrics and performance insights'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-6 hover:border-mint-glow/30 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-mint-glow/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-mint-glow/20 transition-colors">
            <feature.icon size={24} className="text-mint-glow" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
};