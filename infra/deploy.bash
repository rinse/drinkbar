#!/bin/bash
set -eu

SERVICE=$1

function usage() {
    echo 'Usage: deploy.bash (cloudfront|lambdaedge)'
}

if [ $SERVICE = "cloudfront" ]; then
    CERTIFICATE_ARN=$2
    aws cloudformation deploy \
        --stack-name drinkbar-stack \
        --template-file cloudfront.yml \
        --parameter-overrides \
            BucketName=drinkbar.esnir-nzmz.com \
            DomainAlias=drinkbar.esnir-nzmz.com \
            LambdaEdgeFunctionName=drinkbarBasicAuthentication \
            LambdaEdgeFunctionVersion=2 \
            CertificateArn=$CERTIFICATE_ARN
elif [ $SERVICE = "lambdaedge" ]; then
    aws cloudformation --region us-east-1 deploy \
        --stack-name drinkbar-stack \
        --capabilities CAPABILITY_NAMED_IAM \
        --template-file lambdaedge.yml \
        --parameter-overrides \
            DomainName=drinkbar.esnir-nzmz.com
else
    usage
fi
