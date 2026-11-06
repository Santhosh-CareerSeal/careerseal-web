import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oarlzgdbqrgtgfnpisim.supabase.co'
const supabaseKey = 'sb_publishable_1wOLbMrUkXBx0z5pAUkGZQ_xTPQcoOm'

export const supabase = createClient(supabaseUrl, supabaseKey)
