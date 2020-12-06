1. Run the following.

```bash
cloudfront/deploy.bash lambdaedge
```

2. Go to [certificate Manager](https://console.aws.amazon.com/acm/home?region=us-east-1#/) and note the Arn.

3. Run the following.

```bash
cloudfront/deploy.bash cloudfront ${YOUR_CERTIFICATE_ARN}
cd uchiyoso_logs && npm run deploy
```
