const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export interface JWTPayload {
  userId: string
  alias: string
  role: string
  iat?: number
  exp?: number
}

// Convert a string to a Uint8Array
function stringToBuffer(str: string): any {
  return new TextEncoder().encode(str)
}

// Convert an ArrayBuffer to a base64url encoded string
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Convert a base64url encoded string directly to a Uint8Array buffer (binary bytes)
function base64urlToBuffer(str: string): any {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Convert a base64url encoded string back to a UTF-8 string
function base64urlToString(str: string): string {
  const bytes = base64urlToBuffer(str)
  return new TextDecoder().decode(bytes)
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    stringToBuffer(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  // Default: 7 days
  const exp = iat + 60 * 60 * 24 * 7
  const fullPayload: JWTPayload = { ...payload, iat, exp }

  const encodedHeader = bufferToBase64url(stringToBuffer(JSON.stringify(header)))
  const encodedPayload = bufferToBase64url(stringToBuffer(JSON.stringify(fullPayload)))

  const dataToSign = `${encodedHeader}.${encodedPayload}`
  const key = await getCryptoKey(SECRET)
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToBuffer(dataToSign)
  )
  const encodedSignature = bufferToBase64url(signatureBuffer)

  return `${dataToSign}.${encodedSignature}`
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const dataToVerify = `${encodedHeader}.${encodedPayload}`
  
  const key = await getCryptoKey(SECRET)
  
  // Verify signature using binary bytes directly
  const signatureBytes = base64urlToBuffer(encodedSignature)
  const dataBytes = stringToBuffer(dataToVerify)
  
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    dataBytes
  )

  if (!isValid) {
    throw new Error('Invalid JWT signature')
  }

  const payload: JWTPayload = JSON.parse(base64urlToString(encodedPayload))
  
  // Verify expiration
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('JWT expired')
  }

  return payload
}
