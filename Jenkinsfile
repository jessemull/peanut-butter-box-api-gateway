pipeline {
    agent any
    stages {
        stage('Dependencies') {
            steps {
                sh 'docker run --rm -v $(pwd):/app -w /app node:12 npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'docker run --rm -v $(pwd):/app -w /app node:12 npm test'
            }
        }
    }
}