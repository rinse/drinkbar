import {
    CognitoJwk,
    getClientIp,
    getCookies,
    getMethod,
    getQuerystring,
    getUri,
    Headers,
    HttpMethod,
    JwtClaims,
    JwtHeaders,
    mapJwtSections,
    parseCookies,
    parseQueries,
    verifyClaims,
    verifyHeaders,
    ViewerRequestEvent
} from "../src/lib";
import anything = jasmine.anything;

describe('parseQuery', () => {
    it('gets a querystring from an event', () => {
        const querystring = 'aa=1&bb=2&cc=3'
        expect(parseQueries(querystring)).toEqual({ aa: ['1'], bb: ['2'], cc: ['3'], })
    })
    it('gets no querystrings from an event', () => {
        const querystring = ''
        expect(parseQueries(querystring)).toEqual({})
    })
    it('gets queries without a value', () => {
        const querystring = 'aa&bb='
        expect(parseQueries(querystring)).toEqual({ aa: [], bb: [], })
    })
    it('trims keys and values', () => {
        const querystring = ' aa =  1 &   bb = 2'
        expect(parseQueries(querystring)).toEqual({ aa: ['1'], bb: ['2'], })
    })
    it('ignores invalid querystrings', () => {
        const querystring = '=1'
        expect(parseQueries(querystring)).toEqual({})
    })
    it('ignores empty querystrings', () => {
        const querystring = '&'
        expect(parseQueries(querystring)).toEqual({})
    })
})

describe('parseCookie', () => {
    it('parses cookies', () => {
        const cookie = 'aa=1; bb=2'
        expect(parseCookies(cookie)).toEqual({ aa: '1', bb: '2' })
    })
    it('parses no cookies', () => {
        const cookie = ''
        expect(parseCookies(cookie)).toEqual({})
    })
    it('trims keys and values', () => {
        const cookie = ' aa =  1 ;   bb = 2'
        expect(parseCookies(cookie)).toEqual({ aa: '1', bb: '2', })
    })
    it('ignores cookies without a value', () => {
        const cookie = 'aa=; bb=2'
        expect(parseCookies(cookie)).toEqual({ bb: '2' })
    })
    it('ignores cookies without a key', () => {
        const cookie = '=1; bb=2'
        expect(parseCookies(cookie)).toEqual({ bb: '2' })
    })
    it('ignores cookies without a key and a value', () => {
        const cookie = '=; bb=2'
        expect(parseCookies(cookie)).toEqual({ bb: '2' })
    })
})

describe('getCookies', () => {
    it('gets cookies from an event', () => {
        const event = generateViewerRequestEvent('', { cookie: [{ key: 'Cookie', value: 'aa=1; bb=2' }] })
        expect(getCookies(event)).toEqual({ aa: '1', bb: '2' })
    })
})

describe('getClientId', () => {
    it('gets a clientId from an event', () => {
        const event = generateViewerRequestEvent('192.168.0.1')
        expect(getClientIp(event)).toBe('192.168.0.1')
    })
})

describe('getMethod', () => {
    it('gets a method from an event', () => {
        const event = generateViewerRequestEvent('', {}, 'POST')
        expect(getMethod(event)).toBe('POST')
    })
})

describe('getUri', () => {
    it('gets a uri from an event', () => {
        const event = generateViewerRequestEvent('', {}, 'GET', '', '/xyz.png')
        expect(getUri(event)).toBe('/xyz.png')
    })
})

describe('getQuerystring', () => {
    it('gets a querystring from an event', () => {
        const event = generateViewerRequestEvent('', {}, 'GET', 'aa=1&bb=2', '')
        expect(getQuerystring(event)).toBe('aa=1&bb=2')
    })
})

function generateViewerRequestEvent(
    clientIp: string = '',
    headers: Headers = {},
    method: HttpMethod = 'GET',
    querystring: string = '',
    uri: string = ''): ViewerRequestEvent {
    return {
        Records: [{
            cf: {
                request: {
                    clientIp: clientIp,
                    headers: headers,
                    method: method,
                    querystring: querystring,
                    uri: uri
                },
            },
        }],
    }
}

const sampleToken = {
    id_token: 'eyJraWQiOiIxMjM0ZXhhbXBsZT0iLCJhbGciOiJSUzI1NiJ9 .eyJhdF9oYXNoIjoiYWFhYWEiLCJzdWIiOiJiYmJiYiIsImF1ZCI6ImNjY2NjIiwiZXZlbnRfaWQiOiJkZGRkZCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjA5MjM2MjI2LCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLmFwLW5vcnRoZWFzdC0xLmFtYXpvbmF3cy5jb20vYXAtbm9ydGhlYXN0LXBvb2wtaWQiLCJjb2duaXRvOnVzZXJuYW1lIjoiZWVlZWUiLCJleHAiOjE2MDkyMzk4MjYsImlhdCI6MTYwOTIzNjIyNywiZW1haWwiOiJmZmZmZiJ9.ccccc',
    access_token: 'aaa.bbb.ccc',
    refresh_token: 'aaa.bbb.ccc.ddd.eee',
    expires_in: 3600,
    token_type: 'Bearer',
}

describe('mapJwtSections', () => {
    it('maps JWT sections', () => {
        const mappedJwtSections = mapJwtSections(sampleToken.id_token)
        const header = JSON.parse(mappedJwtSections.header)
        expect(header).toEqual({"kid":"1234example=","alg":"RS256"})
        const claims = JSON.parse(mappedJwtSections.claims)
        expect(claims).toEqual({"at_hash":"aaaaa","sub":"bbbbb","aud":"ccccc","event_id":"ddddd","token_use":"id","auth_time":1609236226,"iss":"https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-pool-id","cognito:username":"eeeee","exp":1609239826,"iat":1609236227,"email":"fffff"})
        expect(mappedJwtSections.verifySignature).toEqual(anything())
    })
    it('throws when JWT is malformed', () => {
        const t = () => {
            mapJwtSections('aa.bb')
        }
        expect(t).toThrow(anything())
    })
})

const sampleJwks: { keys: CognitoJwk[] } = {
    "keys": [{
        "kid": "1234example=",
        "alg": "RS256",
        "kty": "RSA",
        "e": "AQAB",
        "n": "1234567890",
        "use": "sig"
    }, {
        "kid": "5678example=",
        "alg": "RS256",
        "kty": "RSA",
        "e": "AQAB",
        "n": "987654321",
        "use": "sig"
    }]
}

describe('verifyHeaders', () => {
    it('verifies headers of a JWT and gets a corresponding public key', () => {
        const mappedJwtSections = mapJwtSections(sampleToken.id_token)
        const headers: JwtHeaders = JSON.parse(mappedJwtSections.header)
        const jwk = verifyHeaders(headers, sampleJwks)
        expect(jwk).toEqual(sampleJwks.keys[0])
    })
    it('gets no public keys there is no matching keys', () => {
        const mappedJwtSections = mapJwtSections(sampleToken.id_token)
        const headers: JwtHeaders = JSON.parse(mappedJwtSections.header)
        const jwk = verifyHeaders(headers, { keys: [] })
        expect(jwk).toEqual(undefined)
    })
})

describe('verifyClaims', () => {
    it('verifies claims of a JWT', () => {
        const mappedJwtSections = mapJwtSections(sampleToken.id_token)
        const claims: JwtClaims = JSON.parse(mappedJwtSections.claims)
        verifyClaims(claims, 'ccccc', 'https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-pool-id', 'id')
    })
    it('throws an exception when aud does not match.', () => {
        const mappedJwtSections = mapJwtSections(sampleToken.id_token)
        const claims: JwtClaims = JSON.parse(mappedJwtSections.claims)
        const t = () => {
            verifyClaims(claims, '', 'https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-pool-id', 'id')
        }
        expect(t).toThrow(anything())
    })
    it('throws an exception when cognitoClientId does not match.', () => {
        const mappedJwtSections = mapJwtSections(sampleToken.id_token)
        const claims: JwtClaims = JSON.parse(mappedJwtSections.claims)
        const t = () => {
            verifyClaims(claims, 'ccccc', '', 'id')
        }
        expect(t).toThrow(anything())
    })
})
