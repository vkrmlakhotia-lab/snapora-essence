import { supabase } from './supabase'
import type { BookPhoto } from '@/types/book'

/**
 * Uploads a single photo file to Supabase Storage.
 * Returns the public signed URL (valid for 10 years).
 */
export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('photos')
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) throw error

  const { data } = await supabase.storage
    .from('photos')
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10) // 10 years

  if (!data?.signedUrl) throw new Error('Failed to get signed URL')

  return data.signedUrl
}

/**
 * Uploads all photos that have a File object attached.
 * Returns a new array with blob URLs replaced by Supabase Storage URLs.
 * Photos without a file (e.g. cloud imports) are returned unchanged.
 */
export async function uploadPhotos(
  photos: BookPhoto[],
  userId: string,
  onProgress?: (uploaded: number, total: number) => void
): Promise<BookPhoto[]> {
  const toUpload = photos.filter(p => p.file)
  let uploaded = 0

  const urlMap = new Map<string, string>()

  await Promise.all(
    toUpload.map(async photo => {
      const url = await uploadPhoto(photo.file!, userId)
      urlMap.set(photo.id, url)
      uploaded++
      onProgress?.(uploaded, toUpload.length)
    })
  )

  return photos.map(p => {
    if (!urlMap.has(p.id)) return p
    return { ...p, url: urlMap.get(p.id)!, file: undefined }
  })
}
