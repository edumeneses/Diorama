'use server'

import { cookies } from 'next/headers'

export const saveEnvironment = async (id: string) => {
  const cookieStore = await cookies()
  cookieStore.set('environment', id)
}

export const getEnvironment = async () => {
  const cookieStore = await cookies()
  return cookieStore.get('environment')?.value
}
