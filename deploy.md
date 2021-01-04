# How to deploy

1. Deploy cloudfront

Prepare a certificate on Certificate Manager when you want to use your own domain name.

`ENVIRONMENT_NAME` is a universally unique value which stands for an environment name.
Typically, it tends to be `dev` or `prod`.

Type the following if you want to use your own domain name.

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME 0 DOMAIN_NAME CERTIFICATE_ARN
```

Otherwise, you specify only `ENVIRONMENT_NAME`.

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME
```

When you don't use your own domain name, go see your distribution and take a note of `Domain Name`.
Your distribution is found in a stack named `drinkbar-stack-cloudfront-ENVIRONMENT_NAME`.

2. Deploy cognito

Type the following to deploy cognito-related resources.
`DOMAIN_NAME` will be your own domain name, or the domain name of your distribution.

```bash
cd infra
./deploy.bash cognito ENVIRONMENT_NAME DOMAIN_NAME
```

3. Deploy lambdaedge

Copy the `lambdaedge/.env.sample` file as `lambdaedge/ENVIRONMENT_NAME.env` and fill it.

Go to Cognito `drinkbar-cognito-stack-ENVIRONMENT_NAME-user-pool` and find the following values.

1. `COGNITO_CLIENT_ID` is the cognito client id.
2. `LOGIN_URL` is the url found by clicking `Launch Hosted UI`.
3. `TOKEN_URI` is `https://drinkbar-ENVIRONMENT_NAME.auth.ap-northeast-1.amazoncognito.com/oauth2/token`

```bash
pushd infra/lambdaedge
./deploy.bash lambdaedge ENVIRONMENT_NAME
```

4. Associate lambdaedge to cloudfront.

Update your distribution with the version number.
`1` is the first number, you'll have to increase it when you update lambdaedge code.

When you have your own domain name, type following.

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME 1 DOMAIN_NAME CERTIFICATE_ARN
```
Otherwise, specify the version number only.

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME 1
```

5. Upload frontend code

```bash
cd uchiyoso_logs && npm run deploy -- s3://drinkbar-ENVIRONMENT_NAME.esnir-nzmz.com
```
