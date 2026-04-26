import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useDocById, findFirstSidebarItemLink, } from '@docusaurus/plugin-content-docs/client';
import { usePluralForm } from '@docusaurus/theme-common';
import isInternalUrl from '@docusaurus/isInternalUrl';
import { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
function useCategoryItemsPlural() {
    const { selectMessage } = usePluralForm();
    return (count) => selectMessage(count, translate({
        message: '1 item|{count} items',
        id: 'theme.docs.DocCard.categoryDescription.plurals',
        description: 'The default description for a category card in the generated index about how many items this category includes',
    }, { count }));
}
function FolderIcon() {
    return (<svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>);
}
function DocumentIcon() {
    return (<svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>);
}
function ExternalLinkIcon() {
    return (<svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>);
}
function CardContainer({ className, href, children, }) {
    return (<Link href={href} className={clsx('card padding--lg', styles.cardContainer, className)}>
      {children}
    </Link>);
}
function CardLayout({ className, href, icon, title, description, }) {
    return (<CardContainer href={href} className={className}>
      <Heading as="h2" className={clsx('text--truncate', styles.cardTitle)} title={title}>
        {icon} {title}
      </Heading>
      {description && (<p className={clsx('text--truncate', styles.cardDescription)} title={description}>
          {description}
        </p>)}
    </CardContainer>);
}
function CardCategory({ item }) {
    const href = findFirstSidebarItemLink(item);
    const categoryItemsPlural = useCategoryItemsPlural();
    // Unexpected: categories that don't have a link have been filtered upfront
    if (!href) {
        return null;
    }
    return (<CardLayout className={item.className} href={href} icon={<FolderIcon />} title={item.label} description={item.description ?? categoryItemsPlural(item.items.length)}/>);
}
function CardLink({ item }) {
    const icon = isInternalUrl(item.href) ? <DocumentIcon /> : <ExternalLinkIcon />;
    const doc = useDocById(item.docId ?? undefined);
    return (<CardLayout className={item.className} href={item.href} icon={icon} title={item.label} description={item.description ?? doc?.description}/>);
}
export default function DocCard({ item }) {
    switch (item.type) {
        case 'link':
            return <CardLink item={item}/>;
        case 'category':
            return <CardCategory item={item}/>;
        default:
            throw new Error(`unknown item type ${JSON.stringify(item)}`);
    }
}
