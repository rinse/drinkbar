#!/bin/bash
set -eu

function usage() {
    echo 'Usage: deploy.bash SERVICE [OPTIONS...]'
    echo '  SERVICE: cognito    ENVIRONMENT_NAME DOMAIN_NAME'
    echo '           lambdaedge ENVIRONMENT_NAME DOMAIN_NAME'
    echo '           cloudfront ENVIRONMENT_NAME DOMAIN_NAME CERTIFICATE_ARN'
}

service=$1
if [ $3 = "" ]; then
    environmentName=""
else
    environmentName=${2:+"-$2"}
fi
domainName=$3

if [ $service = "cloudfront" ]; then
    CERTIFICATE_ARN=$4
    aws cloudformation deploy \
        --stack-name drinkbar-stack${environmentName} \
        --template-file cloudfront.yml \
        --parameter-overrides \
            BucketName=$domainName \
            DomainAlias=$domainName \
            LambdaEdgeFunctionName=drinkbarBasicAuthentication \
            LambdaEdgeFunctionVersion=2 \
            CertificateArn=$CERTIFICATE_ARN
elif [ $service = "lambdaedge" ]; then
    aws cloudformation --region us-east-1 deploy \
        --stack-name drinkbar-stack${environmentName} \
        --capabilities CAPABILITY_NAMED_IAM \
        --template-file lambdaedge.yml \
        --parameter-overrides \
            domainName=$domainName
elif [ $service = "cognito" ]; then
    aws cloudformation deploy \
        --stack-name drinkbar-cognito-stack${environmentName} \
        --template-file cognito.yml \
        --parameter-overrides \
            CallbackURL=$domainName \
            DefaultRedirectURI=$domainName \
            LogoutURL=$domainName \
            EnvironmentName=$environmentName
else
    usage
fi
