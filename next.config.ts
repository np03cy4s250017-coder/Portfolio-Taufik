import type { NextConfig } from 'next'

import { profile } from './src/content/profile'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The CV carries a phone number that appears nowhere in the site's
        // markup, so it is kept out of search indexes.
        //
        // X-Robots-Tag rather than a robots.txt Disallow: a crawler has to
        // fetch the file to read the directive, and disallowing it would stop
        // the fetch that reveals it — leaving the URL eligible for indexing on
        // the strength of inbound links alone. noindex is the instruction that
        // actually removes it.
        source: profile.resume,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, noarchive' }],
      },
    ]
  },
}

export default nextConfig
