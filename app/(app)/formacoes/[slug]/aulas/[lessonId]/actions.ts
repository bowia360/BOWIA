'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function markLessonComplete(lessonId: string, formationSlug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase.from('lesson_progress').upsert(
    {
      profile_id: user.id,
      lesson_id: lessonId,
      progress_percent: 100,
      completed: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,lesson_id' }
  )

  if (error) throw new Error(error.message)

  revalidatePath(`/formacoes/${formationSlug}/aulas/${lessonId}`)
  revalidatePath(`/formacoes/${formationSlug}`)
}
