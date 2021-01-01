#!/bin/bash
set -eu

function usage() {
    echo 'Usage: deploy.bash SERVICE [OPTIONS...]'
    echo '  SERVICE: cognito    ENVIRONMENT_NAME DOMAIN_NAME'
    echo '           lambdaedge ENVIRONMENT_NAME'
    echo '           cloudfront ENVIRONMENT_NAME [LAMBDA_EDGE_FUNCTION_VERSION] [DOMAIN_ALIAS CERTIFICATE_ARN]'
    echo '  ENVIRONMENT_NAME:             A universally unique value which stands for an environment name.'
    echo '  DOMAIN_NAME:                  The domain name of the cloudfront or your own domain name which is alternate to it.'
    echo '  LAMBDA_EDGE_FUNCTION_VERSION: The version of the lambda edge function. The default value is 1.'
    echo '  DOMAIN_ALIAS:                 Your own domain name which is alternate to the cloudfront and the CERTIFICATE_ARN.'
    echo '                                This value should match to DOMAIN_NAME.'
    echo '  CERTIFICATE_ARN:              CERTIFICATE_ARN which is associated to DOMAIN_ALIAS.'
}

if [ -z ${1:-''} ] || [ -z ${2:-''} ]; then
    usage
    exit 1
fi

service=$1
environmentName=${2:+"-$2"}

if [ $service = "cloudfront" ]; then
    lambdaEdgeFunctionVersion=${3:-0}
    domainAlias=${4:-''}
    certificateArn=${5:-''}
    aws cloudformation deploy \
        --stack-name drinkbar-stack-cloudfront${environmentName} \
        --template-file cloudfront.yml \
        --parameter-overrides \
            EnvironmentName=$environmentName \
            LambdaEdgeFunctionName=drinkbarAuthentication${environmentName} \
            LambdaEdgeFunctionVersion=$lambdaEdgeFunctionVersion \
            BucketName=drinkbar-frontend${environmentName} \
            DomainAlias=$domainAlias \
            CertificateArn=$certificateArn
    exit 0
fi

if [ $service = "lambdaedge" ]; then
    pushd lambdaedge
    rm -fr build && mkdir build
    npm clean-install --only=prod && cp -r node_modules ./build/
    # Use dotenv for passing environment variables because lambda@edge doesn't support a usual way.
    cp ${environmentName#-}.env ./build/.env
    npm install && npm run build
    rm -fr ./build/node_modules/.bin
    aws cloudformation package \
        --template-file lambdaedge.yml \
        --output-template-file lambdaedge-packaged.yml \
        --s3-bucket drinkbar-deployment-us-east-1${environmentName} \
        --s3-prefix lambdaedge
    aws cloudformation --region us-east-1 deploy \
        --stack-name drinkbar-stack-lambdaedge${environmentName} \
        --capabilities CAPABILITY_NAMED_IAM \
        --template-file lambdaedge-packaged.yml \
        --parameter-overrides \
            EnvironmentName=$environmentName
    exit 0
fi

if [ $service = "cognito" ]; then
    if [ -z ${3:-''} ]; then
        usage
        exit 1
    fi
    domainName=$3
    aws cloudformation deploy \
        --stack-name drinkbar-cognito-stack${environmentName} \
        --template-file cognito.yml \
        --parameter-overrides \
            CallbackURL="https://$domainName/code" \
            DefaultRedirectURI="https://$domainName/code" \
            LogoutURL="https://$domainName" \
            EnvironmentName=$environmentName
    exit 0
fi

usage
exit 1