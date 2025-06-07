import Head from 'next/head'
import { type ExtendedRecordMap } from 'notion-types'
import { getPageTitle } from 'notion-utils'
import { NotionRenderer } from 'react-notion-x'
import { Collection } from 'react-notion-x/build/third-party/collection'
import { Code } from 'react-notion-x/build/third-party/code'
import { Equation } from 'react-notion-x/build/third-party/equation'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

// Custom Modal component that uses a portal
function CustomModal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="notion-modal-overlay" onClick={onClose}>
      <div className="notion-modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}

function useGalleryGridPagination(itemsPerPage = 4) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  useEffect(() => {
    const grids = document.querySelectorAll('.notion-gallery-grid');
    grids.forEach(grid => {
      const cards = grid.querySelectorAll('.notion-collection-card');
      // Hide all cards beyond visibleCount
      cards.forEach((card, idx) => {
        if (card instanceof HTMLElement) {
          card.style.display = idx < visibleCount ? '' : 'none';
        }
      });

      // Remove any existing button
      if (grid.parentElement) {
        const existingBtn = grid.parentElement.querySelector('.load-more-gallery');
        if (existingBtn) existingBtn.remove();
      }

      // Add Load More button if needed
      if (cards.length > visibleCount && grid.parentElement) {
        const btn = document.createElement('button');
        btn.className = 'load-more-gallery';
        btn.textContent = `Load More (${visibleCount} of ${cards.length})`;
        btn.style.cssText = `
          display: block;
          margin: 1rem auto;
          padding: 8px 16px;
          background: var(--bg-color, #111);
          color: var(--text-color, #fff);
          border: 1px solid var(--text-color, #fff);
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
        `;
        btn.onclick = () => setVisibleCount(prev => prev + itemsPerPage);
        grid.parentElement.appendChild(btn);
      }
    });
  }, [visibleCount, itemsPerPage]);
}

export function NotionPage({
  recordMap,
  rootPageId
}: {
  recordMap: ExtendedRecordMap
  rootPageId?: string
}) {
  if (!recordMap) {
    return null
  }

  const title = getPageTitle(recordMap)

  useGalleryGridPagination(4);

  return (
    <>
      <Head>
        <meta name='description' content='React Notion X Minimal Demo' />
        <title>{title}</title>
        {/* Open Graph tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content="David Feldt's personal website" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://davidfeldt.info/" />
        <meta property="og:image" content="https://davidfeldt.info/og-image.png" />
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content="David Feldt's personal website" />
        <meta name="twitter:image" content="https://davidfeldt.info/og-image.png" />
      </Head>

      <div className="notion-frame" style={{ minHeight: '100vh', position: 'relative' }}>
        <NotionRenderer
          recordMap={recordMap as any}
          fullPage={true}
          darkMode={true}
          rootPageId={rootPageId}
          components={{
            Collection,
            Code,
            Equation,
            Modal: CustomModal
          }}
        />
      </div>
    </>
  )
}
