import { supabase } from '@/lib/supabase/supabaseClient'

export async function getCalendarEntries() {
  const { data, error } = await supabase
    .from('academy_calendar')
    .select('*')

  if (error) {
    throw new Error(error.message)
  }

  return data
}
