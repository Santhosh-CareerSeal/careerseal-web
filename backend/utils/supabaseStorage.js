const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
)

const BUCKET = 'documents'

// Upload a file buffer to the private bucket. Returns the stored path.
async function uploadDocument(path, buffer, mimeType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })
  if (error) throw new Error('Upload failed: ' + error.message)
  return path
}

// Generate a short-lived signed URL (default 5 min) so only authorized viewers can open a file.
async function getSignedUrl(path, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw new Error('Signed URL failed: ' + error.message)
  return data.signedUrl
}

// Delete a file from the bucket.
async function deleteDocument(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw new Error('Delete failed: ' + error.message)
}

module.exports = { uploadDocument, getSignedUrl, deleteDocument }
