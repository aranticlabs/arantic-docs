import React from 'react';
import Head from '@docusaurus/Head';

interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  totalTime?: string;
  estimatedCost?: string;
  supply?: string[];
  tool?: string[];
  steps: HowToStep[];
}

/**
 * HowTo structured data for installation/tutorial pages
 * Helps AI engines generate step-by-step procedural answers
 */
export default function HowToSchema({
  name,
  description,
  totalTime,
  supply,
  tool,
  steps,
}: HowToSchemaProps) {
  const howToData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    ...(totalTime && { "totalTime": totalTime }),
    ...(supply && {
      "supply": supply.map(s => ({
        "@type": "HowToSupply",
        "name": s
      }))
    }),
    ...(tool && {
      "tool": tool.map(t => ({
        "@type": "HowToTool",
        "name": t
      }))
    }),
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.url && { "url": step.url })
    }))
  };

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(howToData)}
      </script>
    </Head>
  );
}
