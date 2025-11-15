// Tag to category mapping
const TAG_CATEGORY_MAP: Record<string, string> = {
  // Finance tags
  'trading': 'Finance',
  'finance': 'Finance',
  'crypto': 'Finance',
  'stocks': 'Finance',
  'investment': 'Finance',
  'banking': 'Finance',
  
  // Content Creation tags
  'writing': 'Content Creation',
  'content': 'Content Creation',
  'blog': 'Content Creation',
  'copywriting': 'Content Creation',
  'creative': 'Content Creation',
  
  // Development tags
  'code': 'Development',
  'programming': 'Development',
  'development': 'Development',
  'software': 'Development',
  'api': 'Development',
  'debugging': 'Development',
  
  // Data Analysis tags
  'analytics': 'Data Analysis',
  'data': 'Data Analysis',
  'analysis': 'Data Analysis',
  'visualization': 'Data Analysis',
  'statistics': 'Data Analysis',
  'insights': 'Data Analysis',
  
  // Social Media tags
  'social': 'Social Media',
  'twitter': 'Social Media',
  'instagram': 'Social Media',
  'facebook': 'Social Media',
  'linkedin': 'Social Media',
  'engagement': 'Social Media',
  
  // Marketing tags
  'marketing': 'Marketing',
  'seo': 'Marketing',
  'advertising': 'Marketing',
  'campaigns': 'Marketing',
  'branding': 'Marketing',
  
  // Language tags
  'translation': 'Language',
  'language': 'Language',
  'nlp': 'Language',
  'text': 'Language',
  'linguistics': 'Language',
  
  // Media tags
  'video': 'Media',
  'audio': 'Media',
  'image': 'Media',
  'media': 'Media',
  'editing': 'Media',
  'production': 'Media',
};

export function categorizeAgentByTags(tags: string[]): string {
  if (!tags || tags.length === 0) return 'Default';
  
  const normalizedTags = tags.map(tag => tag.toLowerCase().trim());
  
  for (const tag of normalizedTags) {
    if (TAG_CATEGORY_MAP[tag]) {
      return TAG_CATEGORY_MAP[tag];
    }
  }
  
  return 'Default';
}

export const AVAILABLE_TAGS = [
  // Finance
  'Trading', 'Finance', 'Crypto', 'Stocks', 'Investment', 'Banking',
  // Content Creation
  'Writing', 'Content', 'Blog', 'Copywriting', 'Creative',
  // Development
  'Code', 'Programming', 'Development', 'Software', 'API', 'Debugging',
  // Data Analysis
  'Analytics', 'Data', 'Analysis', 'Visualization', 'Statistics', 'Insights',
  // Social Media
  'Social', 'Twitter', 'Instagram', 'Facebook', 'LinkedIn', 'Engagement',
  // Marketing
  'Marketing', 'SEO', 'Advertising', 'Campaigns', 'Branding',
  // Language
  'Translation', 'Language', 'NLP', 'Text', 'Linguistics',
  // Media
  'Video', 'Audio', 'Image', 'Media', 'Editing', 'Production',
];
