import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwqlawfbihyvwiyhnigp.supabase.co'
const supabaseKey = 'sb_publishable_9qUHp-ljfNL1V9hjKr6pYg_vWM6pMoW'

export const supabase = createClient(supabaseUrl, supabaseKey)
