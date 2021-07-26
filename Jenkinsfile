pipeline {
    agent {
        docker { image 'node:14-alpine' }
    }
    environment {
        HOME = '.'
    }
    stages {
        stage('Dependencies') {
            steps {
                sh 'npm install'
            }
        }
    }
}