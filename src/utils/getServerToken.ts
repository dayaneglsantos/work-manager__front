'use server'
import { cookies } from 'next/headers'

export async function getServerToken() {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value ?? null
}
