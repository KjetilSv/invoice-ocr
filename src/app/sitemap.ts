import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/baseUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/app`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/privacy`, lastModified: new Date() },
  ];
}
