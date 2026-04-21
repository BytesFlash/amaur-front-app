import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentAdminApi } from '@/modules/content/api/contentAdminApi'
import { contentApi } from '@/modules/content/api/contentApi'
import type {
  BlogCategory,
  BlogPost,
  FaqItem,
  LeadFormEntry,
  MediaAsset,
  SeoEntry,
  ServiceContent,
  SiteSettings,
  StaticPageContent,
  Testimonial,
} from '@/modules/content/types/cms'

const CMS_KEY = ['cms', 'snapshot']

export function useCmsSnapshot() {
  return useQuery({
    queryKey: CMS_KEY,
    queryFn: () => contentApi.getSnapshot(),
  })
}

export function useCmsAdmin() {
  const queryClient = useQueryClient()

  const refresh = () => queryClient.invalidateQueries({ queryKey: CMS_KEY })

  const savePost = useMutation({
    mutationFn: (payload: Partial<BlogPost> & { title: string; excerpt: string }) => contentAdminApi.savePost(payload),
    onSuccess: refresh,
  })

  const deletePost = useMutation({
    mutationFn: (postId: string) => contentAdminApi.deletePost(postId),
    onSuccess: refresh,
  })

  const saveCategory = useMutation({
    mutationFn: (payload: Partial<BlogCategory> & { name: string }) => contentAdminApi.saveCategory(payload),
    onSuccess: refresh,
  })

  const deleteCategory = useMutation({
    mutationFn: (id: string) => contentAdminApi.deleteCategory(id),
    onSuccess: refresh,
  })

  const saveService = useMutation({
    mutationFn: (payload: ServiceContent) => contentAdminApi.saveService(payload),
    onSuccess: refresh,
  })

  const savePage = useMutation({
    mutationFn: (payload: StaticPageContent) => contentAdminApi.savePage(payload),
    onSuccess: refresh,
  })

  const saveFaq = useMutation({
    mutationFn: (payload: Partial<FaqItem> & { pagePath: string; question: string; answer: string }) => contentAdminApi.saveFaq(payload),
    onSuccess: refresh,
  })

  const deleteFaq = useMutation({
    mutationFn: (id: string) => contentAdminApi.deleteFaq(id),
    onSuccess: refresh,
  })

  const saveTestimonial = useMutation({
    mutationFn: (payload: Partial<Testimonial> & { author: string; role: string; quote: string }) =>
      contentAdminApi.saveTestimonial(payload),
    onSuccess: refresh,
  })

  const deleteTestimonial = useMutation({
    mutationFn: (id: string) => contentAdminApi.deleteTestimonial(id),
    onSuccess: refresh,
  })

  const saveSeoEntry = useMutation({
    mutationFn: (payload: Partial<SeoEntry> & { path: string; seo: SeoEntry['seo'] }) => contentAdminApi.saveSeoEntry(payload),
    onSuccess: refresh,
  })

  const saveMediaAsset = useMutation({
    mutationFn: (payload: Partial<MediaAsset> & { fileName: string; url: string; altText: string }) => contentAdminApi.saveMediaAsset(payload),
    onSuccess: refresh,
  })

  const deleteMediaAsset = useMutation({
    mutationFn: (id: string) => contentAdminApi.deleteMediaAsset(id),
    onSuccess: refresh,
  })

  const updateLeadStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadFormEntry['status'] }) => contentAdminApi.updateLeadStatus(id, status),
    onSuccess: refresh,
  })

  const saveSettings = useMutation({
    mutationFn: (settings: SiteSettings) => contentAdminApi.saveSettings(settings),
    onSuccess: refresh,
  })

  const resetAll = useMutation({
    mutationFn: () => contentAdminApi.resetAll(),
    onSuccess: refresh,
  })

  return {
    savePost,
    deletePost,
    saveCategory,
    deleteCategory,
    saveService,
    savePage,
    saveFaq,
    deleteFaq,
    saveTestimonial,
    deleteTestimonial,
    saveSeoEntry,
    saveMediaAsset,
    deleteMediaAsset,
    updateLeadStatus,
    saveSettings,
    resetAll,
  }
}
