import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { Providers } from '@/components/Providers';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <DefaultSeo {...SEO} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}
