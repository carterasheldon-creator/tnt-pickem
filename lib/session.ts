import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'fallback-secret-key-32-chars-min')

export type SessionUser = {
  id: string
  username: string
  isAdmin: boolean
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)
  return token
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}
