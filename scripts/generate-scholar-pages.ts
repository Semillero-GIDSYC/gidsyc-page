import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RESEARCH_LINES } from '../src/data/researchLines';
import { ResearchPublication } from '../src/types';

const rootDir = process.cwd();
const outputDir = join(rootDir, 'public', 'publications');

const htmlEscape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const uniquePublications = () => {
  const bySlug = new Map<string, ResearchPublication>();

  for (const line of RESEARCH_LINES) {
    for (const publication of line.publications) {
      bySlug.set(publication.slug, publication);
    }
  }

  return [...bySlug.values()].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
};

const meta = (name: string, content: string) =>
  `    <meta name="${name}" content="${htmlEscape(content)}">`;

const extractJournalMetadata = (publication: ResearchPublication) => {
  const afterTitle = publication.citation.split(`${publication.title}. `)[1];

  if (!afterTitle || afterTitle.startsWith('En ')) {
    return [];
  }

  const journalTitle = afterTitle.split(', vol. ')[0]?.replace(/\.$/, '').trim();
  const volume = afterTitle.match(/vol\. ([^,\.]+)/)?.[1];
  const issue = afterTitle.match(/no\. ([^,\.]+)/)?.[1];
  const pages = afterTitle.match(/pp\. ([0-9]+)-([0-9]+)/);

  return [
    journalTitle ? meta('citation_journal_title', journalTitle) : null,
    volume ? meta('citation_volume', volume) : null,
    issue ? meta('citation_issue', issue) : null,
    pages ? meta('citation_firstpage', pages[1]) : null,
    pages ? meta('citation_lastpage', pages[2]) : null,
  ].filter(Boolean) as string[];
};

const renderPublicationPage = (publication: ResearchPublication) => {
  const journalMetadata = [
    publication.journalTitle ? meta('citation_journal_title', publication.journalTitle) : null,
    publication.volume ? meta('citation_volume', publication.volume) : null,
    publication.issue ? meta('citation_issue', publication.issue) : null,
    publication.firstPage ? meta('citation_firstpage', publication.firstPage) : null,
    publication.lastPage ? meta('citation_lastpage', publication.lastPage) : null,
  ].filter(Boolean) as string[];

  const citationMeta = [
    meta('robots', 'index,follow'),
    meta('citation_title', publication.title),
    ...publication.authors.map((author) => meta('citation_author', author)),
    meta('citation_publication_date', String(publication.year)),
    meta('citation_online_date', String(publication.year)),
    meta('citation_language', 'en'),
    publication.doi ? meta('citation_doi', publication.doi) : null,
    publication.pdfUrl ? meta('citation_pdf_url', publication.pdfUrl) : null,
    publication.sourceUrl ? meta('citation_fulltext_html_url', publication.sourceUrl) : null,
    ...(journalMetadata.length ? journalMetadata : extractJournalMetadata(publication)),
  ].filter(Boolean).join('\n');
  const publicationLinks = [
    publication.doi ? `<a href="https://doi.org/${htmlEscape(publication.doi)}" rel="noopener noreferrer">DOI</a>` : null,
    publication.sourceUrl
      ? `<a href="${htmlEscape(publication.sourceUrl)}" rel="noopener noreferrer">Article page</a>`
      : null,
    publication.pdfUrl ? `<a href="${htmlEscape(publication.pdfUrl)}" rel="noopener noreferrer">PDF</a>` : null,
    `<a href="${htmlEscape(publication.googleScholarUrl)}" rel="noopener noreferrer">Google Scholar search</a>`,
  ].filter(Boolean);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
${citationMeta}
    <title>${htmlEscape(publication.title)} | GIDSYC</title>
    <style>
      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        color: #0f172a;
        background: #f8fafc;
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 56px 20px;
      }
      article {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        padding: 32px;
      }
      h1 {
        margin: 0 0 16px;
        font-size: 34px;
        line-height: 1.1;
      }
      .authors {
        font-size: 18px;
        color: #475569;
        margin-bottom: 24px;
      }
      .citation {
        font-size: 16px;
        line-height: 1.7;
        color: #334155;
      }
      .abstract {
        font-size: 16px;
        line-height: 1.7;
        color: #334155;
        margin-top: 28px;
      }
      .label {
        margin: 28px 0 8px;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 800;
      }
      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }
      a {
        color: #1d4ed8;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <article>
        <h1>${htmlEscape(publication.title)}</h1>
        <div class="authors">${publication.authors.map(htmlEscape).join('; ')}</div>
        <p class="citation">${htmlEscape(publication.citation)}</p>
        ${
          publication.abstract
            ? `<div class="label">Abstract</div>
        <p class="abstract">${htmlEscape(publication.abstract)}</p>`
            : ''
        }
        <div class="links">
${publicationLinks.map((link) => `          ${link}`).join('\n')}
        </div>
      </article>
    </main>
  </body>
</html>
`;
};

mkdirSync(outputDir, { recursive: true });

const publications = uniquePublications();

for (const publication of publications) {
  writeFileSync(join(outputDir, `${publication.slug}.html`), renderPublicationPage(publication));
}

writeFileSync(
  join(outputDir, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index,follow">
    <title>GIDSYC Publications</title>
  </head>
  <body>
    <main>
      <h1>GIDSYC Publications</h1>
      <ul>
${publications
  .map((publication) => `        <li><a href="./${publication.slug}.html">${htmlEscape(publication.title)}</a></li>`)
  .join('\n')}
      </ul>
    </main>
  </body>
</html>
`
);

console.log(`Generated ${publications.length} Google Scholar publication pages in public/publications`);
