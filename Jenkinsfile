pipeline {
    agent any 

    environment {
        IMAGE_NAME = "ashu51/frontend"
        CONTAINER_NAME = "frontend"
        PRISMA_CONSOLE = 'https://app.ind.prismacloud.io'
    }

    stages {
        stage('Build') {
            steps {
                sh 'BUILD=${BUILD_ID} docker-compose -f docker-compose.prod.yml build'
            }
        }

        stage('Download twistcli') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'prisma-access-key', usernameVariable: 'PRISMA_USER', passwordVariable: 'PRISMA_PASSWORD')]) {
                    sh '''
                        curl -u $PRISMA_USER:$PRISMA_PASSWORD -o twistcli "$PRISMA_CONSOLE/api/v1/util/twistcli"
                        chmod +x twistcli
                    '''
                }
            }
        }

        stage('Scan with Prisma Cloud') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'prisma-access-key', usernameVariable: 'PRISMA_USER', passwordVariable: 'PRISMA_PASSWORD')]) {
                    sh '''
                        ./twistcli images scan \
                            --address $PRISMA_CONSOLE \
                            --user $PRISMA_USER \
                            --password $PRISMA_PASSWORD \
                            --details \
                            --output-file results.json \
                            ${IMAGE_NAME}:${BUILD_ID}
                    '''
                }
            }
        }

        stage('Evaluate Results') {
            steps {
                sh '''
                    if grep -q "vulnerabilities" results.json; then
                        echo "Scan complete. Check report."
                    else
                        echo "No vulnerabilities found."
                    fi
                '''
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-credentials-for-jenkins', passwordVariable: 'REGISTRY_CREDS_PSW', usernameVariable: 'REGISTRY_CREDS_USR')]) {
                    sh '''
                        docker login -u $REGISTRY_CREDS_USR -p $REGISTRY_CREDS_PSW
                        docker tag ${IMAGE_NAME}:${BUILD_ID} ${IMAGE_NAME}:${BUILD_ID}
                        docker push ${IMAGE_NAME}:${BUILD_ID}
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker stop $CONTAINER_NAME || true
                    docker rm $CONTAINER_NAME || true
                    BUILD=${BUILD_ID} docker-compose -f docker-compose.prod.yml up -d
                '''
            }
        }

        stage('Clean up') {
            steps {
                sh 'docker image prune -a -f'
            }
        }
    }
}
