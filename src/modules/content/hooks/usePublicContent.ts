import { useQuery } from '@tanstack/react-query'
import { contentApi } from '@/modules/content/api/contentApi'

export function usePublicSnapshot() {
  return useQuery({
    queryKey: ['public-content', 'snapshot'],
    queryFn: () => contentApi.getSnapshot(),
  })
}

export function useServicePage(slug: string) {
  return useQuery({
    queryKey: ['public-content', 'service', slug],
    queryFn: () => contentApi.getServiceBySlug(slug),
  })
}

export function useBlogPost(slug: string, preview = false) {
  return useQuery({
    queryKey: ['public-content', 'post', slug, preview],
    queryFn: () => contentApi.getPostBySlug(slug, preview),
  })
}

export function useBlogPosts(categorySlug?: string) {
  return useQuery({
    queryKey: ['public-content', 'posts', categorySlug ?? 'all'],
    queryFn: () => contentApi.listPosts(categorySlug),
  })
}
