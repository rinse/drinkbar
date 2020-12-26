import * as dotenv from 'dotenv'

dotenv.config()

export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID
export const TOKEN_URI = process.env.TOKEN_URI
export const LOGIN_URL = process.env.LOGIN_URL
export const COGNITO_ISS = process.env.COGNITO_ISS
export const COGNITO_JWKS_URL = process.env.COGNITO_JWKS_URL
