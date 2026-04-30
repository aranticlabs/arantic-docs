import React from 'react';
import Head from '@docusaurus/Head';
/**
 * Structured Data (JSON-LD) component for SEO and GEO
 * Helps search engines and AI understand Arantic Documentation
 */
export default function StructuredData() {
    const organization = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Arantic Digital",
        "url": "https://arantic.com",
        "logo": {
            "@type": "ImageObject",
            "url": "https://docs.arantic.com/img/brand/arantic-logo-light.svg"
        },
        "sameAs": [
            "https://github.com/aranticlabs"
        ]
    };
    const webSite = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Arantic Documentation",
        "url": "https://docs.arantic.com",
        "description": "Practical guides on using AI tools for programming — prompting, code generation, debugging, testing, Claude Code deep-dives, subagent blueprints, skill templates, and more.",
        "publisher": {
            "@type": "Organization",
            "name": "Arantic Digital"
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://docs.arantic.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        },
        "inLanguage": "en"
    };
    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Arantic Documentation",
                "item": "https://docs.arantic.com"
            }
        ]
    };
    return (<Head>
      <script type="application/ld+json">
        {JSON.stringify(organization)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSite)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </script>
    </Head>);
}
