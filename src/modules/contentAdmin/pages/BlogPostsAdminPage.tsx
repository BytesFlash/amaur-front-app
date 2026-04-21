import { useMemo, useState } from 'react'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import type { BlogPost } from '@/modules/content/types/cms'
import { slugify } from '@/modules/content/lib/cmsUtils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

export function BlogPostsAdminPage() {
  const { data } = useCmsSnapshot()
  const { savePost, deletePost } = useCmsAdmin()
  const categories = data?.categories ?? []

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categorySlug, setCategorySlug] = useState('bienestar-laboral')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [content, setContent] = useState('')

  const selectedPost = useMemo(
    () => data?.posts.find((post) => post.id === selectedPostId) ?? null,
    [data?.posts, selectedPostId],
  )

  if (!data) {
    return null
  }

  function loadPost(post: BlogPost) {
    setSelectedPostId(post.id)
    setTitle(post.title)
    setSlug(post.slug)
    setExcerpt(post.excerpt)
    setCategorySlug(post.categorySlug)
    setStatus(post.status)
    setMetaTitle(post.seo.title)
    setMetaDescription(post.seo.description)
    setContent(post.sections.map((section) => section.paragraphs.join('\n\n')).join('\n\n'))
  }

  function clearForm() {
    setSelectedPostId(null)
    setTitle('')
    setSlug('')
    setExcerpt('')
    setCategorySlug(categories[0]?.slug ?? 'bienestar-laboral')
    setStatus('draft')
    setMetaTitle('')
    setMetaDescription('')
    setContent('')
  }

  async function handleSave() {
    if (!title || !excerpt) {
      toast.error('Titulo y excerpt son obligatorios.')
      return
    }

    const paragraphs = content
      .split('\n\n')
      .map((part) => part.trim())
      .filter(Boolean)

    await savePost.mutateAsync({
      id: selectedPostId ?? undefined,
      title,
      slug: slug || slugify(title),
      excerpt,
      categorySlug,
      status,
      sections: [
        {
          heading: 'Contenido',
          paragraphs: paragraphs.length ? paragraphs : ['Completa este articulo desde el panel.'],
        },
      ],
      seo: {
        title: metaTitle || `${title} | Blog AMAUR`,
        description: metaDescription || excerpt,
        canonicalPath: `/blog/${slug || slugify(title)}`,
      },
    })

    toast.success(selectedPostId ? 'Post actualizado.' : 'Post creado.')
    clearForm()
  }

  async function handleDelete(postId: string) {
    await deletePost.mutateAsync(postId)
    toast.success('Post eliminado.')
    if (selectedPostId === postId) {
      clearForm()
    }
  }

  const previewSlug = slug || slugify(title || 'preview-post')

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-xl border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Posts ({data.posts.length})</h2>
          <Button size="sm" variant="outline" onClick={clearForm}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo
          </Button>
        </div>

        <div className="space-y-2">
          {data.posts
            .slice()
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((post) => (
              <article key={post.id} className="rounded-lg border p-3">
                <button type="button" className="w-full text-left" onClick={() => loadPost(post)}>
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">/{post.slug}</p>
                </button>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="rounded-full border px-2 py-0.5">{post.status}</span>
                  <button type="button" className="text-destructive" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Editor de post</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Soporta slug editable, estado borrador/publicado, metadata SEO y preview antes de publicar.
        </p>

        <div className="mt-4 grid gap-4">
          <div>
            <Label>Titulo *</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titulo del articulo" />
          </div>
          <div>
            <Label>Slug editable *</Label>
            <Input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="slug-del-articulo" />
          </div>
          <div>
            <Label>Excerpt *</Label>
            <Textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Categoria</Label>
              <Select value={categorySlug} onValueChange={setCategorySlug}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Meta title</Label>
            <Input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
          </div>
          <div>
            <Label>Meta description</Label>
            <Textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} rows={2} />
          </div>
          <div>
            <Label>Contenido (separar parrafos con linea en blanco)</Label>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              placeholder="Editor enriquecido mock: conecta aqui un editor real (TipTap/Quill) cuando exista backend definitivo."
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={savePost.isPending}>
            Guardar post
          </Button>
          <Button asChild variant="outline">
            <a href={`/blog/${previewSlug}?preview=1`} target="_blank" rel="noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </a>
          </Button>
        </div>

        {selectedPost && (
          <p className="mt-4 text-xs text-muted-foreground">
            Editando: {selectedPost.title}. Actualizado: {new Date(selectedPost.updatedAt).toLocaleString('es-CL')}
          </p>
        )}
      </section>
    </div>
  )
}
