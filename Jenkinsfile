pipeline {
    agent any 

    environment {
        IMAGE_TAG = "ashu51/frontend"
        CONTAINER_NAME = "frontend"
        // REGISTRY_CREDS = credentials('registry-credentials-for-jenkins')
        PRISMA_API_URL="https://api.ind.prismacloud.io"
    }

    stages {
        
        stage('Build') {
            steps {
                sh 'BUILD=${BUILD_ID} docker-compose -f docker-compose.prod.yml build'
            }
        }

        stages {
            stage('Checkout') {
              steps {
                  git branch: 'main', url: 'https://github.com/Invecto-technologies-pvt-ltd/portal-jenkins'
                  stash includes: '**/*', name: 'source'
              }
            }
            stage('Checkov') {
                steps {
                    withCredentials([usernamePassword(credentialsId: 'Prisma', usernameVariable: 'pc_user', passwordVariable: 'pc_password')]) {
                        script {
                            docker.image('bridgecrew/checkov:latest').inside("--entrypoint=''") {
                              unstash 'source'
                              try {
                                  sh 'checkov -d . --use-enforcement-rules -o cli -o junitxml --output-file-path console,results.xml --bc-api-key ${pc_user}::${pc_password} --repo-id  Invecto-technologies-pvt-ltd/portal-jenkins --branch main'
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
        }
        options {
            preserveStashes()
            timestamps()
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: '  ', passwordVariable: 'REGISTRY_CREDS_PSW', usernameVariable: 'REGISTRY_CREDS_USR')]) {
                    sh '''
                        docker login -u $REGISTRY_CREDS_USR -p $REGISTRY_CREDS_PSW
                        docker tag $IMAGE_TAG:$BUILD_ID $IMAGE_TAG:$BUILD_ID
                        docker push $IMAGE_TAG:$BUILD_ID
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