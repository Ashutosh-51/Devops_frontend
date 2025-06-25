pipeline {
    agent any 

    environment {
        IMAGE_TAG = "ashu51/frontend"
        CONTAINER_NAME = "frontend"
        PRISMA_API_URL = "https://api.ind.prismacloud.io"
    }

    stages {

        stage('Build') {
            steps {
                sh '''
                    BUILD=${BUILD_ID} docker-compose -f docker-compose.prod.yml build
                '''
            }
        }

        stage('Checkov') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'Prisma', usernameVariable: 'pc_user', passwordVariable: 'pc_password')]) {
                    script {
                        docker.image('bridgecrew/checkov:latest').inside("--entrypoint=''") {
                            try {
                                sh '''
                                    checkov -d . \
                                    --use-enforcement-rules \
                                    -o cli -o junitxml \
                                    --output-file-path console,results.xml \
                                    --bc-api-key ${pc_user}::${pc_password} \
                                    --repo-id Ashutosh-51/Devops_frontend \
                                    --branch master
                                '''
                                junit skipPublishingChecks: true, testResults: 'results.xml'
                            } catch (err) {
                                junit skipPublishingChecks: true, testResults: 'results.xml'
                                throw err
                            }
                        }
                    }
                }
            }   
        }

        stage('Prisma Image Scan') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'Prisma', usernameVariable: 'PC_USER', passwordVariable: 'PC_PASSWORD')]) {
                    sh '''
                        echo "[INFO] Scanning image with twistcli..."
                        ./twistcli images scan \
                        --address https://asia-south1.cloud.twistlock.com/india-1131958783 \
                        --user "$PC_USER" \
                        --password "$PC_PASSWORD" \
                        --details \
                        --output-file scan-report.json \
                        $IMAGE_TAG:$BUILD_ID

                        echo "[INFO] Archiving scan report..."
                    '''
                    archiveArtifacts artifacts: 'scan-report.json', onlyIfSuccessful: true
                }
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-credentials-for-jenkins', passwordVariable: 'REGISTRY_CREDS_PSW', usernameVariable: 'REGISTRY_CREDS_USR')]) {
                    sh '''
                        echo "$REGISTRY_CREDS_PSW" | docker login -u "$REGISTRY_CREDS_USR" --password-stdin
                        docker tag $IMAGE_TAG:$BUILD_ID $IMAGE_TAG:$BUILD_ID
                        docker push $IMAGE_TAG:$BUILD_ID
                        docker logout
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
