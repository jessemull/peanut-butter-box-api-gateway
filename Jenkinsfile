pipeline {
    agent any
    stages {
        stage('Dependencies') {
            steps {
                sh 'docker run --rm node:14-alpine npm install'
            }
        }
    }
}