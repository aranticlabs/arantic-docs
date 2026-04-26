import React from 'react';
import Head from '@docusaurus/Head';
/**
 * HowTo structured data for installation/tutorial pages
 * Helps AI engines generate step-by-step procedural answers
 */
export default function HowToSchema({ name, description, totalTime, supply, tool, steps, }) {
    const howToData = {
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
    return (<Head>
      <script type="application/ld+json">
        {JSON.stringify(howToData)}
      </script>
    </Head>);
}
