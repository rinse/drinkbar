# How to deploy

1. Deploy cloudfront

Prepare a certificate on Certificate Manager when you want to use your own domain name.

`ENVIRONMENT_NAME` is a universally unique value which stands for an environment name.
Typically, it tends to be `dev` or `prod`.

Type the following if you want to use your own domain name.

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME DOMAIN_ALIAS CERTIFICATE_ARN
```

Otherwise, you specify only `ENVIRONMENT_NAME`.

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME
```

2. Deploy cognito

Type the following to deploy cognito-related resources.
`DOMAIN_ALIAS` will be your own domain name.

```bash
cd infra
./deploy.bash cognito ENVIRONMENT_NAME [DOMAIN_ALIAS]
```

3. Deploy lambdaedge

Type the following and deploy a lambda function.

```bash
pushd infra/lambdaedge
./deploy.bash lambdaedge ENVIRONMENT_NAME
```

4. Associate the lambdaedge function to the cloudfront.

Update your distribution. It will find a version of lambda edge and associate it for you.

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME DOMAIN_NAME CERTIFICATE_ARN
```

```bash
cd infra
./deploy.bash cloudfront ENVIRONMENT_NAME
```

5. Upload frontend code

```bash
cd uchiyoso_logs && npm run deploy -- s3://drinkbar-frontend-ENVIRONMENT_NAME
```
