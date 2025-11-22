import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  titleTemplate: '%s | 0rca POD Marketplace',
  defaultTitle: '0rca POD Marketplace - Premium AI Agent Marketplace',
  description: 'Discover and hire AI agents for your tasks. Browse premium AI agents built with cutting-edge technology.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://0rca.live/',
    siteName: '0rca POD Marketplace',
    images: [
      {
        url: 'https://0rca.live/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '0rca POD Marketplace',
      },
    ],
  },
  twitter: {
    handle: '@0rca',
    site: '@0rca',
    cardType: 'summary_large_image',
  },
};

export default config;
