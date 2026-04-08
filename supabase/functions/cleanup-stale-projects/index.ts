import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const ONE_YEAR_AGO = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

Deno.serve(async () => {
  try {
    const [orderedResult, draftResult] = await Promise.all([
      archiveOrderedProjects(),
      archiveDraftProjects(),
    ])

    return Response.json({
      ok: true,
      ordered: orderedResult,
      drafts: draftResult,
    })
  } catch (err) {
    console.error('cleanup-stale-projects failed:', err)
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
})

/**
 * Deletes Storage objects and archives book projects that were ordered
 * more than 1 year ago.
 */
async function archiveOrderedProjects(): Promise<{ archived: number; photosDeleted: number }> {
  const { data: projects, error } = await supabase
    .from('book_projects')
    .select('id')
    .eq('status', 'ordered')
    .lt('ordered_at', ONE_YEAR_AGO)

  if (error) throw error
  if (!projects || projects.length === 0) return { archived: 0, photosDeleted: 0 }

  const projectIds = projects.map(p => p.id)
  return deletePhotosAndArchive(projectIds, 'ordered (1 year retention expired)')
}

/**
 * Deletes Storage objects and archives draft projects that haven't been
 * edited in more than 30 days.
 */
async function archiveDraftProjects(): Promise<{ archived: number; photosDeleted: number }> {
  const { data: projects, error } = await supabase
    .from('book_projects')
    .select('id')
    .eq('status', 'draft')
    .lt('updated_at', THIRTY_DAYS_AGO)

  if (error) throw error
  if (!projects || projects.length === 0) return { archived: 0, photosDeleted: 0 }

  const projectIds = projects.map(p => p.id)
  return deletePhotosAndArchive(projectIds, 'draft (30 day inactivity)')
}

async function deletePhotosAndArchive(
  projectIds: string[],
  reason: string
): Promise<{ archived: number; photosDeleted: number }> {
  // Fetch all storage paths for these projects
  const { data: photos, error: photosError } = await supabase
    .from('book_photos')
    .select('id, storage_path')
    .in('project_id', projectIds)
    .not('storage_path', 'is', null)

  if (photosError) throw photosError

  const storagePaths = (photos || [])
    .map(p => p.storage_path as string)
    .filter(Boolean)

  // Delete from Storage in batches of 100 (Supabase limit)
  let photosDeleted = 0
  for (let i = 0; i < storagePaths.length; i += 100) {
    const batch = storagePaths.slice(i, i + 100)
    const { error } = await supabase.storage.from('photos').remove(batch)
    if (error) console.error('Storage deletion error:', error)
    else photosDeleted += batch.length
  }

  // Clear photo URLs in DB (keep the rows for layout/metadata history)
  await supabase
    .from('book_photos')
    .update({ url: null, storage_path: null })
    .in('project_id', projectIds)

  // Archive the projects
  await supabase
    .from('book_projects')
    .update({ status: 'archived', cover_photo: null })
    .in('id', projectIds)

  console.log(`Archived ${projectIds.length} projects (${reason}), deleted ${photosDeleted} photos`)

  return { archived: projectIds.length, photosDeleted }
}
