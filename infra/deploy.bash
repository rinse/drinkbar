#!/bin/bash
set -eu

function usage() {
    echo 'Usage: deploy.bash SERVICE [OPTIONS...]'
    echo '  SERVICE: cloudfront ENVIRONMENT_NAME [DOMAIN_ALIAS CERTIFICATE_ARN]'
    echo '           cognito    ENVIRONMENT_NAME [DOMAIN_ALIAS]'
    echo '           lambdaedge ENVIRONMENT_NAME'
    echo '  ENVIRONMENT_NAME:             A universally unique value which stands for an environment name.'
    echo '  LAMBDA_EDGE_FUNCTION_VERSION: The version of the lambda edge function. The default value is 1.'
    echo '  DOMAIN_ALIAS:                 Your own domain name which is alternate to the cloudfront and the CERTIFICATE_ARN.'
    echo '                                This value should match to DOMAIN_ALIAS.'
    echo '  CERTIFICATE_ARN:              CERTIFICATE_ARN which is associated to DOMAIN_ALIAS.'
}

if [ -z ${1:-''} ] || [ -z ${2:-''} ]; then
    usage
    exit 1
fi

service=$1
environmentName=${2:+"-$2"}

if [ $service = "cloudfront" ]; then
    lambdaedgeStackName=drinkbar-stack-lambdaedge${environmentName}
    lambdaedgeStackId=$(
        aws cloudformation --region us-east-1 describe-stacks \
                --stack-name $lambdaedgeStackName \
            | jq -r '.Stacks[0].StackId' \
            || echo '')
    lambdaedgeOutputs=$(
        aws cloudformation --region us-east-1 list-exports \
                --no-paginate \
                --query "Exports[?ExportingStackId==\`${lambdaedgeStackId}\`]" \
            | jq -c 'from_entries')
    if [ $lambdaedgeOutputs = "{}" ]; then
        lambdaEdgeVersion=""
    else
        lambdaEdgeVersion=$(echo $lambdaedgeOutputs | jq -r ".[\"drinkbarLambdaEdgeVersion${environmentName}\"]")
    fi
    domainAlias=${3:-''}
    certificateArn=${4:-''}
    aws cloudformation deploy \
        --stack-name drinkbar-stack-cloudfront${environmentName} \
        --template-file cloudfront.yml \
        --parameter-overrides \
            EnvironmentName=$environmentName \
            LambdaEdgeVersion=$lambdaEdgeVersion \
            BucketName=drinkbar-frontend${environmentName} \
            DomainAlias=$domainAlias \
            CertificateArn=$certificateArn
    exit 0
fi

if [ $service = "lambdaedge" ]; then
    # Generate a dotenv file for this environment.
    cognitoStackName=drinkbar-cognito-stack${environmentName}
    cognitoStackId=$(aws cloudformation describe-stacks --stack-name $cognitoStackName | jq -r '.Stacks[0].StackId')
    cognitoOutputs=$(aws cloudformation list-exports --no-paginate --query "Exports[?ExportingStackId==\`${cognitoStackId}\`]" | jq -c 'from_entries')
    cognitoClientId=$(echo $cognitoOutputs | jq -r ".[\"DrinkbarUserPoolClient${environmentName}\"]")
    loginUrl=$(echo $cognitoOutputs | jq -r ".[\"DrinkbarLoginUrl${environmentName}\"]")
    tokenUri=$(echo $cognitoOutputs | jq -r ".[\"DrinkbarTokenUri${environmentName}\"]")
    cognitoIss=$(echo $cognitoOutputs | jq -r ".[\"DrinkbarCognitoIss${environmentName}\"]")
    cognitoJwksUrl=$(echo $cognitoOutputs | jq -r ".[\"DrinkbarCognitoJwksUrl${environmentName}\"]")
    cat <<- EOF > lambdaedge/${environmentName#-}.env
		COGNITO_CLIENT_ID=$cognitoClientId
		LOGIN_URL=$loginUrl
		TOKEN_URI=$tokenUri
		COGNITO_ISS=$cognitoIss
		COGNITO_JWKS_URL=$cognitoJwksUrl
	EOF

    pushd lambdaedge
    rm -fr build && mkdir build
    npm clean-install --only=prod && cp -r node_modules ./build/
    # Use dotenv for passing environment variables because lambda@edge doesn't support a usual way.
    cp ${environmentName#-}.env ./build/.env
    npm install && npm run build
    rm -fr ./build/node_modules/.bin
    aws s3 --region us-east-1 mb s3://drinkbar-deployment-us-east-1${environmentName}
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
    domainName=${3:-''}
    aws cloudformation deploy \
        --stack-name drinkbar-cognito-stack${environmentName} \
        --template-file cognito.yml \
        --parameter-overrides \
            EnvironmentName=$environmentName \
            DomainName=$domainName
    exit 0
fi

usage
exit 1
