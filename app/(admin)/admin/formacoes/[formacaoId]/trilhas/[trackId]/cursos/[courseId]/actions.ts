'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Acesso negado')
}

export async function createLesson(courseId: string, formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()
  const durationRaw = formData.get('duration_seconds') as string
  const { error } = await admin.from('lessons').insert({
    course_id: courseId,
    title: formData.get('title') as string,
    video_url: (formData.get('video_url') as string) || null,
    duration_seconds: durationRaw ? Number(durationRaw) : null,
    order_index: Number(formData.get('order_index') ?? 0),
    is_published: formData.get('is_published') === 'true',
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/formacoes`)
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
  await assertAdmin()
  const admin = createAdminClient()
  const durationRaw = formData.get('duration_seconds') as string
  const { error } = await admin.from('lessons').update({
    title: formData.get('title') as string,
    video_url: (formData.get('video_url') as string) || null,
    duration_seconds: durationRaw ? Number(durationRaw) : null,
    order_index: Number(formData.get('order_index') ?? 0),
    is_published: formData.get('is_published') === 'true',
  }).eq('id', lessonId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/formacoes`)
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from('lessons').delete().eq('id', lessonId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/formacoes`)
}
