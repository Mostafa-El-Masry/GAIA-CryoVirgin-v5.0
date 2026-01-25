'use server'

export async function loginAction() {
  throw new Error(
    'Server-side login is disabled. Use client AuthContext instead.'
  )
}
