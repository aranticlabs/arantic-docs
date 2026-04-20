import React from 'react';
import StructuredData from '@site/src/components/StructuredData';
/**
 * Root component wrapper for Docusaurus
 * Includes global components like structured data
 */
export default function Root({ children }) {
    return (<>
      <StructuredData />
      {children}
    </>);
}
