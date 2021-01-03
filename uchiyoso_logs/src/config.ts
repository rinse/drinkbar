export interface Config {
    region: string
    identityPoolId: string
    identityProviderKey: string
    staticBucketName: string
}

export function loadConfig(): Config {
    switch (process.env.NODE_ENV) {
        case 'production': {
            return {
                region: process.env.REACT_APP_PROD_REGION ?? '',
                identityPoolId: process.env.REACT_APP_PROD_IDENTITY_POOL_ID ?? '',
                identityProviderKey: process.env.REACT_APP_PROD_IDENTITY_PROVIDER_KEY ?? '',
                staticBucketName: process.env.REACT_APP_PROD_STATIC_BUCKET_NAME ?? '',
            }
        }
        case 'development': {
            return {
                region: process.env.REACT_APP_DEV_REGION ?? '',
                identityPoolId: process.env.REACT_APP_DEV_IDENTITY_POOL_ID ?? '',
                identityProviderKey: process.env.REACT_APP_DEV_IDENTITY_PROVIDER_KEY ?? '',
                staticBucketName: process.env.REACT_APP_DEV_STATIC_BUCKET_NAME ?? '',
            }
        }
        case 'test': {
            return {
                region: process.env.REACT_APP_TEST_REGION ?? '',
                identityPoolId: process.env.REACT_APP_TEST_IDENTITY_POOL_ID ?? '',
                identityProviderKey: process.env.REACT_APP_TEST_IDENTITY_PROVIDER_KEY ?? '',
                staticBucketName: process.env.REACT_APP_TEST_STATIC_BUCKET_NAME ?? '',
            }
        }
    }
}
