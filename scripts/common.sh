#!/usr/bin/env bash
function validate_env() {
    echo "::debug::Validating \$ENV=${ENV}"
    if [[ -z "${ENV:-}" ]]
    then
        echo "::error title={"ENV"}::\$ENV is not set. Exiting."
        exit 1
    fi

    if [[ "$ENV" != "dev" && "$ENV" != "test" && "$ENV" != "security" && "$ENV" != "local" && "$ENV" != "build" && "$ENV" != "prod" ]]
    then
        echo "::error title={"ENV"}::\$ENV is not set to dev, test, security, local, build or production. Exiting."
        exit 1
    fi
}

validate_env # be sure that env is correctly set as other functions depend on it

readonly repo="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd)"
readonly COMPOSE_PROJECT_NAME="tarpisto-$ENV"

function compose_cmd() {
    required_command docker
    required_command docker-compose

    if [[ "$ENV" == "test" || "$ENV" == "build" ]]
    then
        docker-compose -f docker-compose.yml "$@"
    else
        docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml "$@"
    fi
}

function check_node_version() {
    pushd "$repository"
    echo "::debug::Setting up right Node version"

    # This will use always repo provided nvm if nvm is not in PATH etc.
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    source "./scripts/nvm.sh"
    nvm use || nvm install

    popd
}

function required_command() {
    if ! command -v $1 &> /dev/null
    then
        echo "$1 could not be found"
        exit
    fi
}

function docker_health_check() {
    required_command docker

    if ! docker ps &> /dev/null
    then
        exit
    fi
}

function npm_ci() {
    pushd "$repository"
    echo "::debug::Installing node and dependencies with npm ci"

    check_node_version

    required_command shasum

    # check if shashum is same, do not run npm ci
    if shasum -c "node_modules/package-lock.json.sha1" &> /dev/null
    then
        echo "package-lock.json has not changed, no need for npm ci"
    else
        echo "package-lock.json has changed, running npm ci"
        npm ci
        shasum "package-lock.json" > "node_modules/package-lock.json.sha1"
    fi

    popd
}

function db_health_check() {
    pushd "$repository"

    echo "::debug::Database health check in $COMPOSE_PROJECT_NAME"
    COUNTER=0
    until compose_cmd exec -t db pg_isready -U tarpisto &>/dev/null; do
        echo "Waiting for database to be healthy. Trying again in 5 seconds."

        COUNTER=$((COUNTER+1))

        if [ $COUNTER -gt 10 ]
        then
            echo "::error title={"DB Health check"}::Database not responding after 10 tries. Exiting."
            exit 1
        fi

        sleep 5;
    done

    popd
}

function s3_health_check() {
    pushd "$repository"

    required_command curl

    echo "::debug::S3 health check in $COMPOSE_PROJECT_NAME"
    COUNTER=0
    until curl -I "http://$(compose_cmd port s3 9001)/minio/health/live" &>/dev/null; do
        echo "Waiting for s3 to be healthy. Trying again in 5 seconds."

        COUNTER=$((COUNTER+1))

        if [ $COUNTER -gt 10 ]
        then
            echo "::error title={"S3 Health check"}::Database not responding after 10 tries. Exiting."
            exit 1
        fi

        sleep 5;
    done

    popd
}

function start_db_s3() {
    echo "::group::Starting database and S3"
    compose_cmd up -d db s3

    db_health_check
    s3_health_check
    echo "::endgroup::"
}

function build_app() {
    echo "::group::Building application"

    required_command npm

    get_environment_variables

    echo "::debug::Running database migrations"
    NODE_ENV=development npm run db:migrate
    echo "::debug::Building application"
    npm run build
    echo "::endgroup::"
}

function build_docker_image() {
    echo "::group::Building application image"
    required_command docker

    build_app

    export PROGRESS_NO_TRUNC=1

    if [[ -z ${DOCKER_INFO-} ]]
    then
        DOCKER_INFO='{ "target": { "docker-metadata-action": { "tags": [ "tarpisto/tarpisto:latest" ] } } } '
        echo "::group::Print combined bake file"
        docker buildx bake -f docker-bake.hcl -f - <<< ${DOCKER_INFO} --print
        echo "::endgroup::"

        echo "::group::Building docker image"
        docker buildx bake -f docker-bake.hcl -f - <<< ${DOCKER_INFO}
        echo "::endgroup::"
    else
        echo "::group::Print combined bake file"
        docker buildx bake -f docker-bake.hcl -f ${DOCKER_INFO} --print
        echo "::endgroup::"

        echo "::group::Building docker image"
        docker buildx bake -f docker-bake.hcl -f ${DOCKER_INFO}
        echo "::endgroup::"
    fi
    echo "::endgroup::"
}

function get_environment_variables() {
    if [[ "$ENV" == "dev" || "$ENV" == "test" || "$ENV" == "security" || "$ENV" == "local" || "$ENV" == "build" ]]
    then
        # Set environment variables for local development only and for build process to have DB access even though it will be empty
        export PG_CONNECTION_STRING=${PG_CONNECTION_STRING:-"postgresql://tarpisto:tarpisto@$(compose_cmd port db 5432)/tarpisto"}

        export USER_SERVICE_SERVICE_ID=${USER_SERVICE_SERVICE_ID:-"11188b9c-9534-4faf-8355-60973b720647"}
        export USER_SERVICE_URL=${USER_SERVICE_URL:-"http://127.0.0.1:8080"}
        export USER_SERVICE_SECRET=${USER_SERVICE_SECRET:-"catlike-meringue-tying-PASTERN-bed-simply"}

        export NEXTAUTH_URL=${NEXTAUTH_URL:-"http://127.0.0.1:9000"}
        export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-"catlike-meringue-tying-PASTERN-bed-simply"}

        export AWS_REGION=${AWS_REGION:-"eu-west-1"}
        export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-"tarpisto"}
        export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-"tarpisto"}

        export AWS_S3_ENDPOINT=${AWS_S3_ENDPOINT:-"http://$(compose_cmd port s3 9001)"}
        export AWS_S3_BUCKET_ID=${AWS_S3_BUCKET_ID:-"tarpisto-local"}

        export OTEL_SERVICE_NAME=${OTEL_SERVICE_NAME:-"tarpisto"}
        export OTEL_ENDPOINT=${OTEL_ENDPOINT:-"http://localhost/notexisting"}
        export OTEL_AUTHORIZATION=${OTEL_AUTHORIZATION:-"http://localhost/notexisting"}
    fi

    # Set environment dependant variables
    if [[ "$ENV" == "dev" ]]
    then
        export PORT=${PORT:-"9000"}
        export APP_ENV="development"
        export NODE_ENV="development"
    elif [[ "$ENV" == "test" ]]
    then
        export PORT=${PORT:-"9010"}
        export APP_ENV="development"
        export NODE_ENV="test"
    elif [[ "$ENV" == "security" ]]
    then
        export PORT=${PORT:-"9020"}
        export APP_ENV="development"
        export NODE_ENV="production"
    elif [[ "$ENV" == "local" ]]
    then
        export PORT=${PORT:-"9030"}
        export APP_ENV="development"
        export NODE_ENV="production"
    else
        export PORT=${PORT:-"9000"}
        export APP_ENV="production"
        export NODE_ENV="production"
    fi

    # Set environment variables for all environments
    export NEXT_TELEMETRY_DISABLED=1
}