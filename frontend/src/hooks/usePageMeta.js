import { useEffect } from 'react'

const SITE_NAME = 'DigitalMarketplace'

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Sets the document title + meta description (and matching OG/Twitter
 * tags) for the current route. This app is a client-rendered SPA, so
 * these only help search engines that execute JS and social-share
 * unfurlers — but they're the cheapest per-page SEO win available here.
 */
export default function usePageMeta(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    document.title = fullTitle

    if (description) {
      setMeta('description', description)
      setMeta('og:title', fullTitle, 'property')
      setMeta('og:description', description, 'property')
      setMeta('twitter:title', fullTitle)
      setMeta('twitter:description', description)
    }
  }, [title, description])
}
