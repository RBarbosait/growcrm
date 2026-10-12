"use client"

import { FormEvent, useEffect, useState } from "react"
import { Heart, ImagePlus, LoaderCircle, MessageCircle, Megaphone, Pin, Send, Trash2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://growcrm-api-production.up.railway.app"
const CLOUD_NAME = "dvlfzrpeq"
const UPLOAD_PRESET = "casadata"
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
type WallAuthor = { id: string; name: string | null; email: string }
type WallComment = { id: string; content: string; createdAt: string; author: WallAuthor; canDelete: boolean }
type WallPost = { id: string; content: string; imageUrl: string | null; isOfficial: boolean; isPinned: boolean; createdAt: string; author: WallAuthor; comments: WallComment[]; likedByMe: boolean; likeCount: number; commentCount: number; canDelete: boolean }
type Props = { clubId: string; clubName: string; role: "ADMIN" | "MEMBER" }

function sortPosts(items: WallPost[]) {
  return [...items].sort((a, b) => Number(b.isOfficial) - Number(a.isOfficial) || Number(b.isPinned) - Number(a.isPinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
function displayName(author: WallAuthor) { return author.name?.trim() || author.email.split("@")[0] }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) }

export default function ClubWall({ clubId, clubName, role }: Props) {
  const [posts, setPosts] = useState<WallPost[]>([])
  const [accessToken, setAccessToken] = useState("")
  const [content, setContent] = useState("")
  const [pinned, setPinned] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [busyAction, setBusyAction] = useState<{ id: string; kind: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    async function loadWall() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error("Tu sesión venció. Volvé a ingresar.")
        if (active) setAccessToken(session.access_token)
        const response = await fetch(`${API_URL}/club/${clubId}/wall`, { headers: { Authorization: `Bearer ${session.access_token}` } })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || "No se pudo cargar el muro.")
        if (active) setPosts(Array.isArray(result) ? result : [])
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el muro.")
      } finally { if (active) setLoading(false) }
    }
    void loadWall()
    return () => { active = false }
  }, [clubId])

  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(`${API_URL}${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...init.headers } })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || "No se pudo completar la acción.")
    return result
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) { setError("Elegí un archivo de imagen."); return }
    if (file.size > MAX_IMAGE_SIZE) { setError("La imagen debe pesar menos de 10 MB."); return }
    setUploadingImage(true); setError("")
    setImagePreview(URL.createObjectURL(file)); setImageUrl(null)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("upload_preset", UPLOAD_PRESET)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || typeof result.secure_url !== "string") throw new Error("No se pudo subir la imagen. Probá con otra foto.")
      setImageUrl(result.secure_url)
    } catch (e) {
      setImagePreview(null)
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.")
    } finally { setUploadingImage(false) }
  }

  function removeImage() {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview)
    setImagePreview(null); setImageUrl(null)
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((!content.trim() && !imageUrl) || posting || uploadingImage) return
    setPosting(true); setError("")
    try {
      const post = await request(`/club/${clubId}/wall`, { method: "POST", body: JSON.stringify({ content, imageUrl, isPinned: role === "ADMIN" && pinned }) })
      setPosts((current) => sortPosts([post, ...current])); setContent(""); setPinned(false); removeImage()
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo publicar.") } finally { setPosting(false) }
  }

  async function toggleLike(post: WallPost) {
    if (busyId) return
    setBusyId(post.id); setBusyAction({ id: post.id, kind: "like" }); setError("")
    try {
      const result = await request(`/club/${clubId}/wall/${post.id}/likes`, { method: "POST" })
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, likedByMe: result.liked, likeCount: result.likeCount } : item))
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo actualizar el me gusta.") } finally { setBusyId(null); setBusyAction(null) }
  }

  async function addComment(event: FormEvent<HTMLFormElement>, post: WallPost) {
    event.preventDefault()
    const text = (commentDrafts[post.id] || "").trim()
    if (!text || busyId) return
    setBusyId(post.id); setBusyAction({ id: post.id, kind: "comment" }); setError("")
    try {
      const comment = await request(`/club/${clubId}/wall/${post.id}/comments`, { method: "POST", body: JSON.stringify({ content: text }) })
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: [...item.comments, comment], commentCount: item.commentCount + 1 } : item))
      setCommentDrafts((current) => ({ ...current, [post.id]: "" }))
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo agregar el comentario.") } finally { setBusyId(null); setBusyAction(null) }
  }

  async function deletePost(post: WallPost) {
    if (!post.canDelete || busyId || !window.confirm("¿Querés eliminar esta publicación y sus comentarios?")) return
    setBusyId(post.id); setBusyAction({ id: post.id, kind: "delete-post" }); setError("")
    try {
      await request(`/club/${clubId}/wall/${post.id}`, { method: "DELETE" })
      setPosts((current) => current.filter((item) => item.id !== post.id))
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo eliminar la publicación.") } finally { setBusyId(null); setBusyAction(null) }
  }

  async function deleteComment(post: WallPost, comment: WallComment) {
    if (!comment.canDelete || busyId || !window.confirm("¿Querés eliminar este comentario?")) return
    setBusyId(post.id); setBusyAction({ id: post.id, kind: "delete-comment" }); setError("")
    try {
      await request(`/club/${clubId}/wall/${post.id}/comments/${comment.id}`, { method: "DELETE" })
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: item.comments.filter((entry) => entry.id !== comment.id), commentCount: Math.max(0, item.commentCount - 1) } : item))
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo eliminar el comentario.") } finally { setBusyId(null); setBusyAction(null) }
  }

  async function togglePinned(post: WallPost) {
    if (role !== "ADMIN" || busyId) return
    setBusyId(post.id); setBusyAction({ id: post.id, kind: "pin" }); setError("")
    try {
      const result = await request(`/club/${clubId}/wall/${post.id}`, { method: "PATCH", body: JSON.stringify({ isPinned: !post.isPinned }) })
      setPosts((current) => sortPosts(current.map((item) => item.id === post.id ? { ...item, isPinned: result.isPinned } : item)))
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo destacar el aviso.") } finally { setBusyId(null); setBusyAction(null) }
  }

  return <section id="muro" className="scroll-mt-24 pt-8 sm:pt-10"><div className="mx-auto max-w-3xl">
    <header className="mb-5"><p className="text-sm font-semibold text-emerald-700">La comunidad de {clubName}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172c29]">Muro del club</h1><p className="mt-2 text-sm text-zinc-500">Compartí novedades, hacé preguntas y conversá con otros socios.</p></header>
    <form onSubmit={publish} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"><label htmlFor="wall-post" className="sr-only">Escribí una publicación</label><textarea id="wall-post" value={content} onChange={(event) => setContent(event.target.value)} maxLength={3000} placeholder={role === "ADMIN" ? "Compartí un aviso oficial con el club..." : "¿Qué querés compartir con el club?"} className="min-h-28 w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />{imagePreview && <div className="relative mt-3 inline-block"><img src={imagePreview} alt="Vista previa de la imagen" className="max-h-64 max-w-full rounded-2xl object-cover" />{uploadingImage && <span role="status" aria-live="polite" className="absolute inset-0 flex items-center justify-center gap-2 rounded-2xl bg-black/50 text-sm font-semibold text-white"><LoaderCircle className="h-5 w-5 animate-spin" />Subiendo imagen…</span>}<button type="button" onClick={removeImage} disabled={uploadingImage} aria-label="Quitar imagen" className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-zinc-700 shadow disabled:opacity-50"><X className="h-4 w-4" /></button></div>}<div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500"><span>{content.length}/3000</span><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"><ImagePlus className="h-4 w-4" />{uploadingImage ? "Subiendo…" : "Agregar imagen"}<input type="file" accept="image/*" className="sr-only" disabled={posting || uploadingImage} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = "" }} /></label>{role === "ADMIN" && <><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800"><Megaphone className="h-3.5 w-3.5" />Publicación oficial</span><label className="inline-flex cursor-pointer items-center gap-2"><input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} className="rounded border-zinc-300 text-emerald-700 focus:ring-emerald-500" />Destacar arriba</label></>}</div><button type="submit" disabled={posting || uploadingImage || (!content.trim() && !imageUrl)} className="inline-flex items-center gap-2 rounded-xl bg-[#006b55] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#005c49] disabled:cursor-not-allowed disabled:opacity-50">{posting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Publicando…</> : <>Publicar<Send className="h-4 w-4" /></>}</button></div></form>
    {error && <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {loading ? <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">Cargando publicaciones…</div> : posts.length === 0 ? <div className="mt-5 rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center"><MessageCircle className="mx-auto h-8 w-8 text-emerald-700" /><h2 className="mt-3 font-bold text-[#172c29]">Empezá la conversación</h2><p className="mt-1 text-sm text-zinc-500">Todavía no hay publicaciones. Podés ser la primera persona en compartir algo.</p></div> : <div className="mt-5 grid gap-4">{posts.map((post) => <article key={post.id} className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${post.isOfficial ? "border-emerald-200 ring-1 ring-emerald-100" : "border-zinc-200"}`}>
      {post.isPinned && <div className="flex items-center gap-2 bg-emerald-800 px-5 py-2 text-xs font-bold text-white"><Pin className="h-3.5 w-3.5" />Aviso destacado</div>}
      <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${post.isOfficial ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-700"}`}>{displayName(post.author).slice(0, 1).toUpperCase()}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-bold text-[#172c29]">{displayName(post.author)}</p>{post.isOfficial && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800"><Megaphone className="h-3 w-3" />Oficial del club</span>}</div><p className="mt-0.5 text-xs text-zinc-400">{formatDate(post.createdAt)}</p></div></div><div className="flex shrink-0 items-center gap-1">{role === "ADMIN" && post.isOfficial && <button type="button" disabled={!!busyId} aria-label={post.isPinned ? "Quitar destacado" : "Destacar publicación"} title={post.isPinned ? "Quitar destacado" : "Destacar publicación"} onClick={() => void togglePinned(post)} className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-800">{busyAction?.id === post.id && busyAction.kind === "pin" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Pin className={`h-4 w-4 ${post.isPinned ? "fill-current text-emerald-700" : ""}`} />}</button>}{post.canDelete && <button type="button" disabled={!!busyId} aria-label="Eliminar publicación" title="Eliminar publicación" onClick={() => void deletePost(post)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-700">{busyAction?.id === post.id && busyAction.kind === "delete-post" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>}</div></div>
      {post.content && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-700">{post.content}</p>}{post.imageUrl && <img src={post.imageUrl} alt={`Imagen compartida por ${displayName(post.author)}`} loading="lazy" className="mt-4 max-h-[32rem] w-full rounded-2xl bg-zinc-50 object-contain" />}<div className="mt-5 flex items-center gap-4 border-y border-zinc-100 py-2"><button type="button" disabled={busyId === post.id} onClick={() => void toggleLike(post)} className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition ${post.likedByMe ? "text-rose-600" : "text-zinc-500 hover:text-rose-600"}`}>{busyAction?.id === post.id && busyAction.kind === "like" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />} {busyAction?.id === post.id && busyAction.kind === "like" ? "Actualizando…" : "Me gusta"} <span>{post.likeCount}</span></button><span className="inline-flex items-center gap-2 px-2 text-sm text-zinc-500"><MessageCircle className="h-4 w-4" />{post.commentCount} {post.commentCount === 1 ? "comentario" : "comentarios"}</span></div>
      <div className="pt-3">{post.comments.map((comment) => <div key={comment.id} className="flex items-start justify-between gap-3 rounded-xl px-2 py-2 hover:bg-zinc-50"><div className="min-w-0"><p className="text-xs font-bold text-zinc-700">{displayName(comment.author)} <span className="ml-1 font-normal text-zinc-400">{formatDate(comment.createdAt)}</span></p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">{comment.content}</p></div>{comment.canDelete && <button type="button" disabled={!!busyId} aria-label="Eliminar comentario" title="Eliminar comentario" onClick={() => void deleteComment(post, comment)} className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-700">{busyAction?.id === post.id && busyAction.kind === "delete-comment" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}</button>}</div>)}<form onSubmit={(event) => void addComment(event, post)} className="mt-2 flex gap-2"><label htmlFor={`comment-${post.id}`} className="sr-only">Escribí un comentario</label><input id={`comment-${post.id}`} value={commentDrafts[post.id] || ""} maxLength={1200} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Escribí un comentario..." className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /><button type="submit" disabled={busyId === post.id || !(commentDrafts[post.id] || "").trim()} aria-label="Enviar comentario" className="rounded-xl bg-zinc-100 px-3 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50">{busyAction?.id === post.id && busyAction.kind === "comment" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></form></div>
      </div></article>)}</div>}
  </div></section>
}
