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

  return (
    <>
      <Head>
        <meta name='description' content='React Notion X Minimal Demo' />
        <title>{title}</title>
      </Head>

      <div className="notion-frame" style={{ minHeight: '100vh', position: 'relative' }}>
        <NotionRenderer
          recordMap={recordMap}
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
