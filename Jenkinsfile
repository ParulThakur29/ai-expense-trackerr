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

        stage('Prepare Environment') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'groq-api-key',
                        variable: 'GROQ_API_KEY'
                    )
                ]) {
                    sh '''
                        printf "GROQ_API_KEY=%s\\n" "$GROQ_API_KEY" > backend/.env
                    '''
                }
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh 'docker compose config'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
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

        always {
            sh 'rm -f backend/.env'
        }
    }
}git add Jenkinsfile