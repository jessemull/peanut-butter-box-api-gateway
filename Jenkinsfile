pipeline {
    agent any
    environment {
        AWS_ACCESS_KEY_ID=credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY=credentials('AWS_SECRET_ACCESS_KEY')
        IMAGE_TAG="peanutbutterbox:${BUILD_ID}"
    }
    stages {
        stage('Build') {
            steps {
                sh './jenkins/build/build.sh'
            }
        }
        stage('Test') {
            steps {
                sh './jenkins/test/test.sh'
            }
        }
        stage('Deploy') {
            steps {
                sh './jenkins/deploy/deploy.sh'
            }
        }
    }
    post {
        always {
            sh './jenkins/post/post.sh'
        }
    }
}