import { supabase } from '@/lib/supabase/supabaseClient'

export async function getProgrammingSections() {
  const { data, error } = await supabase
    .from('programming_sections')
    .select('*')

  if (error) {
    throw new Error(error.message)
  }

  return data
}
