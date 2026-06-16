/**
 * seoSchemas.js
 * Centralized JSON-LD structured data schemas for ChatFrame.
 * Used by SEOHead component for per-page injection.
 */

const BASE_URL = 'https://chatframe.com';

// ─── Organization ───────────────────────────────────────────────────────────
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ChatFrame',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.svg`,
  description:
    'ChatFrame is an AI-powered agentic customer support platform that combines intelligent automation with real human support.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@chatframe.com',
    availableLanguage: 'English',
  },
  sameAs: [
    'https://twitter.com/chatframe',
    'https://linkedin.com/company/chatframe',
  ],
};

// ─── SoftwareApplication ────────────────────────────────────────────────────
export const SOFTWARE_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ChatFrame',
  url: BASE_URL,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Customer Support Software',
  operatingSystem: 'Web',
  description:
    'AI-powered customer support platform. Automate tickets, deploy a smart chat widget, and let AI resolve repetitive queries with human escalation for complex issues.',
  featureList: [
    'AI-powered ticket resolution',
    'Embeddable chat widget',
    'Real-time inbox with live updates',
    'CSAT analytics dashboard',
    'Custom AI training with your FAQs',
    'Human escalation for complex queries',
    'Role-based access control',
    '40+ integrations',
  ],
  screenshot: `${BASE_URL}/og-image.png`,
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '0',
      priceCurrency: 'USD',
      description: '500 AI responses/month, 1 workspace, basic analytics',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '29',
      priceCurrency: 'USD',
      description:
        'Unlimited AI responses, 5 workspaces, advanced analytics, custom AI training',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      price: '99',
      priceCurrency: 'USD',
      description:
        'Everything in Pro, unlimited workspaces, dedicated account manager, SLA guarantee',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '128',
    bestRating: '5',
  },
};

// ─── FAQ Page ────────────────────────────────────────────────────────────────
export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is ChatFrame?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChatFrame is an AI-powered customer support platform that combines intelligent automation with real human support. Businesses can manage tickets, live chats, AI responses, analytics, and team workflows from one unified workspace.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does ChatFrame AI work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChatFrame AI uses company-specific FAQs and support context to generate intelligent customer responses. Every reply is assigned a confidence score, and low-confidence queries are automatically escalated to human agents.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can ChatFrame replace human support agents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. ChatFrame is designed to assist support teams, not replace them. AI handles repetitive queries while human agents focus on complex customer issues and real-time conversations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when AI cannot solve a query?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If the AI confidence score drops below a configured threshold, the ticket is escalated instantly to a human agent along with the complete conversation history and AI-generated suggestions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can businesses customize AI responses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Companies can upload FAQs, knowledge base content, support categories, and branding information to make AI responses company-specific instead of generic.',
      },
    },
    {
      '@type': 'Question',
      name: 'What roles are available inside ChatFrame?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ChatFrame currently supports three roles: Company Owners / Admins, Support Agents, and Customers. Each role receives a different dashboard experience and permission system tailored to their workflow.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does ChatFrame provide analytics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. ChatFrame includes analytics for ticket volume, AI resolution rate, escalation tracking, CSAT scores, response times, and operational insights — all from one dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can ChatFrame be embedded into websites?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Businesses can integrate ChatFrame into their websites using an embeddable support widget with customizable branding, colors, welcome messages, and AI-powered conversations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does ChatFrame support AI-assisted replies for agents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Human agents receive AI-generated suggested replies and conversation summaries directly inside the support inbox to speed up resolutions and reduce manual effort.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is ChatFrame secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. ChatFrame uses JWT authentication, bcrypt password hashing, role-based access control, and tenant-level data isolation to protect all customer and company data.',
      },
    },
  ],
};

// ─── WebSite (enables Sitelinks search box) ─────────────────────────────────
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ChatFrame',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// ─── Combined bundle for the homepage ───────────────────────────────────────
export const HOME_JSON_LD = [
  ORGANIZATION_SCHEMA,
  SOFTWARE_APP_SCHEMA,
  FAQ_SCHEMA,
  WEBSITE_SCHEMA,
];
