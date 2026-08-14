pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    }

    stages {

        stage('Install Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Install Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Validate Docker Compose') {
            steps {
                withEnv(['GROQ_API_KEY=dummy-key-for-ci']) {
                    sh 'docker compose config'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                withEnv(['GROQ_API_KEY=dummy-key-for-ci']) {
                    sh 'docker compose build'
                }
            }
        }
    }

    post {
        success {
            echo 'AI Expense Tracker pipeline completed successfully!'
        }

        failure {
            echo 'AI Expense Tracker pipeline failed.'
        }
    }
}