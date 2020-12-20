# How to deploy on your local 

1. Deploy cognito

```bash
infra/deploy.bash cognito ENVIRONMENT_NAME DOMAIN_NAME
```

2. Deploy lambdaedge

```bash
infra/deploy.bash lambdaedge ENVIRONMENT_NAME DOMAIN_NAME
```

3. Go to [certificate Manager](https://console.aws.amazon.com/acm/home?region=us-east-1#/) and note the Arn.

4. Deploy cloudfront

```bash
infra/deploy.bash cloudfront ENVIRONMENT_NAME DOMAIN_NAME ${YOUR_CERTIFICATE_ARN}
```

5. Upload frontend code

```bash
cd uchiyoso_logs && npm run deploy
```
