pipeline {
    agent any 

    environment {
        IMAGE_TAG = "ashu51/frontend"
        CONTAINER_NAME = "frontend"
        // REGISTRY_CREDS = credentials('registry-credentials-for-jenkins')
    }

    stages {
        
        stage('Build') {
            steps {
                sh 'BUILD=${BUILD_ID} docker-compose -f docker-compose.prod.yml build'
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-credentials-for-jenkins', passwordVariable: 'REGISTRY_CREDS_PSW', usernameVariable: 'REGISTRY_CREDS_USR')]) {
                    sh '''
                        docker login -u $REGISTRY_CREDS_USR -p $REGISTRY_CREDS_PSW
                        docker tag $IMAGE_TAG:$BUILD_ID $IMAGE_TAG:$BUILD_ID
                        docker push $REGISTRY_CREDS_USR/$IMAGE_TAG:$BUILD_ID
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
