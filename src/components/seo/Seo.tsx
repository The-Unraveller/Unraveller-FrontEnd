import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  schema?: Record<string, unknown>;
}

const SITE_NAME = 'The Unraveller';
const SITE_URL = 'https://theunraveller.com';

const Seo = ({
  title,
  description,
  keywords,
  canonical,
  noIndex = false,
  ogImage,
  ogType = 'website',
  schema,
}: SeoProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const image = ogImage || `${SITE_URL}/logo.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  description: 'English learning app through realistic simulation for Gen Z Vietnam.',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
});

export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
});

export const softwareSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  description:
    'Learn English through realistic simulation with AI NPCs, gamification and interactive scenarios.',
  url: SITE_URL,
  screenshot: `${SITE_URL}/logo.png`,
});

export default Seo;
