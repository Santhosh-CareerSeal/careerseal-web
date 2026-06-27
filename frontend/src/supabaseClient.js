import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqlawfbihyvwiyhnigp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cWxhd2ZiaWh5dndpeWhuaWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDQyOTYsImV4cCI6MjA5NzA4MDI5Nn0.Ik4lJFCuzlg9t2qQ9PO1u8AdsV88qG5S1gqjhU3EzKE'

export const supabase = createClient(supabaseUrl, supabaseKey)
