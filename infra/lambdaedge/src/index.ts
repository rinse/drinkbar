import fetch from 'node-fetch'
import {COGNITO_CLIENT_ID, COGNITO_ISS, COGNITO_JWKS_URL, LOGIN_URL, TOKEN_URI} from './config'
import {
    getCookies,
    getQuerystring,
    getRequest,
    getUri,
    parseQueries,
    Response, verifyJwt,
    ViewerRequestEvent,
} from './lib'

const LOGIN_SESSION_NAME = '_drinkbar_login_session'
const OAUTH_CODE_PATH = '/code'

/*
 * browser                     handler                  cognito  s3
 *    Logging in
 *    | -> unauthed request ("/") |                       |      |
 *    | <--status 301             |                       |      |
 *    | ----------------------------> request login page  |      |
 *    | <---------------------------- response login page |      |
 *    | ----------------------------> post login request  |      |
 *    | <---------------------------- status 301, token   |      |
 *    | -> token ("/code")        |                       |      |
 *    | <- sessionId              |                       |      |
 *    | -> authed request ("/")   |                       |      |
 *    |                           | ---------------------------> |
 *    |                           | <--------------------------- |
 *    | <------------------------ |                       |      |

 *    Getting a new session id with a refresh token
 *    | -> expired request ("/")  |                       |      |
 *    |                           | -> refresh token      |      |
 *    |                           | <- new token          |      |
 *    | <- new sessionId          |                       |      |
 */
export async function handler(event: ViewerRequestEvent): Promise<Response> {
    console.log(event)
    const host = getRequest(event).headers.host?.[0]?.value;
    if (!host) {
        console.log('The host header is not set. Headers: ', getRequest(event).headers)
        return badRequest()
    }
    if (getUri(event) === OAUTH_CODE_PATH) {
        const codes = parseQueries(getQuerystring(event)).code ?? []
        if (codes.length !== 1) {
            console.log('Bad Authorization code.', codes)
            return badRequest()
        }
        return acceptCode(codes[0], `https://${host}`)
    }
    const cookies = getCookies(event)
    const sessionId = cookies[LOGIN_SESSION_NAME]
    if (!sessionId) {
        console.log('unauthorized', cookies)
        return redirectToLoginUrl()
    }
    if (await verifySession(sessionId)) {
        return getRequest(event)
    }
    try {
        const newSession = await refreshSession(sessionId)
        return {
            status: 302,
            statusDescription: 'found',
            headers: {
                location: [{key: 'Location', value: `https://${host}${getUri(event)}`}],
                'set-cookie': [{key: 'Set-Cookie', value: newSession}],
            },
        }
    } catch (error) {
        console.error(error)
        return redirectToLoginUrl()
    }
}

async function acceptCode(code: string, baseUrl: string): Promise<Response> {
    try {
        const token = await fetchToken(code, baseUrl)
        const sessionId = issueSessionId(token)
        const session = `${LOGIN_SESSION_NAME}=${sessionId}; Secure; HttpsOnly`
        return {
            status: 302,
            statusDescription: 'found',
            headers: {
                location: [{key: 'Location', value: baseUrl}],
                'set-cookie': [{key: 'Set-Cookie', value: session}],
            },
        }
    } catch (error) {
        console.error(error)
        return unauthorized()
    }
}

interface Token {
    access_token: string
    refresh_token: string
    id_token: string
    token_type: string
    expires_in: number
}

/**
 * @throws Error when it fails.
 */
async function fetchToken(code: string, host: string): Promise<Token> {
    const data = await fetch(TOKEN_URI, {
        method: 'POST',
        body: Object.entries({
            grant_type: 'authorization_code',
            client_id: COGNITO_CLIENT_ID,
            redirect_uri: host + OAUTH_CODE_PATH,
            code: code,
        }).map(([key, value]) => key + '=' + encodeURIComponent(value)).join('&'),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then(data => data.json())
    if ('error' in data) {
        throw new Error(data.error)
    }
    return data
}

async function refreshToken(refreshToken: string): Promise<Token> {
    const data = await fetch(TOKEN_URI, {
        method: 'POST',
        body: Object.entries({
            grant_type: 'refresh_token',
            client_id: COGNITO_CLIENT_ID,
            refresh_token: refreshToken,
        }).map(([key, value]) => key + '=' + encodeURIComponent(value)).join('&'),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then(data => data.json())
    if ('error' in data) {
        throw new Error(data.error)
    }
    return data
}

function issueSessionId(token: Token): string {
    console.log('token', token)
    return JSON.stringify(token)
}

/**
 * @param sessionId
 * @returns if sessionId is valid
 * @nothrow
 */
async function verifySession(sessionId: string): Promise<boolean> {
    try {
        const token: Token = JSON.parse(sessionId)
        const idToken = token.id_token
        const jwks = await fetch(COGNITO_JWKS_URL, {
            headers: {
                Accept: 'application/json',
            },
        }).then(a => a.json())
        verifyJwt(idToken, jwks, COGNITO_CLIENT_ID, COGNITO_ISS, 'id')
        console.log('JWT verified', idToken)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

/**
 * @param sessionId
 * @returns new session
 * @throws Error when it fails to fetch a new token.
 */
async function refreshSession(sessionId: string): Promise<string> {
    const token: Token = JSON.parse(sessionId)
    const newToken = await refreshToken(token.refresh_token)
    const newSessionId = issueSessionId(newToken)
    return `${LOGIN_SESSION_NAME}=${newSessionId}; Secure; HttpsOnly`
}

function badRequest(): Response {
    return {
        status: 400,
        statusDescription: 'Bad Request',
    }
}

function unauthorized(): Response {
    return {
        status: 401,
        statusDescription: 'Unauthorized',
    }
}

function redirectToLoginUrl(): Response {
    return {
        status: 302,
        statusDescription: 'found',
        headers: {
            location: [{key: 'Location', value: LOGIN_URL}],
        },
    }
}
