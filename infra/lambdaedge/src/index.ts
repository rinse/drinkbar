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
const TOKEN_PATH = '/token'

/*
 *
 * browser                     handler                  cognito  s3
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
    const loggedIn = sessionId && await verifySession(sessionId)
    if (getUri(event) == TOKEN_PATH) {
        if (!loggedIn) {
            return unauthorized()
        }
        return ok(JSON.stringify({idToken: loadIdToken(sessionId)}))
    }
    if (!loggedIn) {
        return redirectToLoginUrl()
    }
    return getRequest(event)
}

/**
 * @param code    OAuth code
 * @param baseUrl Base url of the host server.
 * @nothrow
 */
async function acceptCode(code: string, baseUrl: string): Promise<Response> {
    try {
        const token = await fetchToken(code, baseUrl)
        const sessionId = issueSessionId(token)
        const session = `${LOGIN_SESSION_NAME}=${sessionId}; Secure; HttpsOnly`
        return {
            status: 302,
            statusDescription: 'found',
            headers: {
                location: [{ key: 'Location', value: baseUrl }],
                'set-cookie': [{ key: 'Set-Cookie', value: session }],
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

// sessionId = id_token
function issueSessionId(token: Token) {
    console.log('token', token)
    return token.id_token
}

function loadIdToken(sessionId: string): string {
    return sessionId
}

/**
 * @param sessionId
 * @returns boolean
 * @nothrow
 */
async function verifySession(sessionId: string) {
    try {
        const idToken = loadIdToken(sessionId)
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

function ok(body: string, encoding: 'text' | 'base64' = 'text'): Response {
    return {
        status: 200,
        statusDescription: 'OK',
        bodyEncoding: encoding,
        body: body
    }
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
            location: [{ key: 'Location', value: LOGIN_URL }],
        },
    }
}
