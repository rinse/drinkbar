import atob = require('atob')
import jwkToPem = require('jwk-to-pem')
import * as jsonwebtoken from 'jsonwebtoken'

export interface ViewerRequestEvent {
    Records: EventRecord[]
}

export interface EventRecord {
    cf: CloudFront
}

export interface CloudFront {
    request: Request
}

export interface Request {
    clientIp: string
    headers: Headers
    method: HttpMethod
    querystring: string
    uri: string
}

export type Response =
    | Request
    | {
          status: number
          statusDescription?: string
          headers?: Headers
      }

export type HttpMethod =
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH'

export function getCookies(event: ViewerRequestEvent): Cookies {
    const headers = getHeaders(event)
    const cookieRaw = headers.cookie
    return cookieRaw ? parseCookies(cookieRaw[0].value) : {}
}

export function getRequest(event: ViewerRequestEvent): Request {
    return event.Records[0].cf.request
}

export function getClientIp(event: ViewerRequestEvent): string {
    return getRequest(event).clientIp
}

export function getMethod(event: ViewerRequestEvent): HttpMethod {
    return getRequest(event).method
}

export function getUri(event: ViewerRequestEvent): string {
    return getRequest(event).uri // e.g. '/xxx.png'
}

export function getQuerystring(event: ViewerRequestEvent): string {
    return getRequest(event).querystring ?? ''
}

type Queries = { [k: string]: string[] }

export function parseQueries(queryString: string): Queries {
    return queryString.split('&').reduce((acc, query) => {
        if (query) {
            const [key, value] = query.split('=').map((a) => a.trim())
            if (key) {
                const newValue = acc[key] ?? []
                if (value) {
                    newValue.push(value)
                }
                acc[key] = newValue
            }
        }
        return acc
    }, {})
}

export type Headers = {
    [k: string]: { key: string; value: string }[]
}

export function getHeaders(event: ViewerRequestEvent): Headers {
    return getRequest(event).headers
}

export type Cookies = { [k: string]: string }

export function parseCookies(cookieRaw: string): Cookies {
    return cookieRaw.split(';').reduce((acc, cookie) => {
        if (cookie) {
            const [k, v] = cookie.split('=').map((a) => a.trim())
            if (k && v) {
                acc[k] = v
            }
        }
        return acc
    }, {})
}

class InvalidJwtError extends Error {
    constructor(...args) {
        super(...args)
        Object.defineProperty(this, 'name', {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true,
        })
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidJwtError)
        }
    }
}

/**
 * @throws Error when jwt is not valid
 */
export function verifyJwt(jwt: string, jwks: any, cognitoClientId: string, iss: string, tokenUse: 'id' | 'access') {
    const mappedJwtSections = mapJwtSections(jwt)
    const headers: JwtHeaders = JSON.parse(mappedJwtSections['header'])
    const jwk = verifyHeaders(headers, jwks)
    if (jwk === undefined) {
        throw new InvalidJwtError('A kid of the JWS does not match to the public keys.')
    }
    verifySignature(jwt, jwk)
    const claims: JwtClaims = JSON.parse(mappedJwtSections['claims'])
    verifyClaims(claims, cognitoClientId, iss, tokenUse)
}

export const JWT_SECTIONS = ['header', 'claims', 'verifySignature']

export function mapJwtSections(jwt: string) {
    const sections = jwt.split('.')
    if (sections.length !== 3) {
        throw new InvalidJwtError('The JWS has an invalid number of sections.')
    }
    return sections.map(a => atob(a))
        .reduce((acc, decoded, i) => {
            const section = JWT_SECTIONS[i]
            acc[section] = decoded
            return acc
        }, {} as { header: string, claims: string, verifySignature: string, })
}

export interface JwtHeaders {
    kid: string
    alg: string
}

export interface CognitoJwk extends jwkToPem.RSA {
    alg: string
    kid: string
    use: string
}

export function verifyHeaders(headers: JwtHeaders, jwks: { keys: CognitoJwk[] }): CognitoJwk | undefined  {
    return jwks.keys.find(key => key.alg === headers.alg && key.kid === headers.kid)
}

/**
 * @throws Error when JWT is not valid.
 */
export function verifySignature(jwt: string, jwk: CognitoJwk): object | string {
    const pem = jwkToPem(jwk)
    return jsonwebtoken.verify(jwt, pem, { algorithms: ['RS256'] })
}

export interface JwtClaims {
    at_hash: string
    sub: string
    aud: string
    event_id: string
    token_use: string
    auth_time: number
    iss: string
    'cognito:username': string
    exp: number
    iat: number
    email: string
}

export function verifyClaims(claims: JwtClaims, cognitoClientId: string, iss: string, tokenUse: 'id' | 'access') {
    if (claims.aud !== cognitoClientId) {
        throw new InvalidJwtError('aud does not match.')
    }
    if (claims.iss !== iss) {
        throw new InvalidJwtError('iss does not match.')
    }
    if (claims.token_use !== tokenUse) {
        throw new InvalidJwtError('token_use does not match.')
    }
}
