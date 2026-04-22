pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  stages {
    stage('Backend Install') {
      steps {
        dir('backend') {
          bat 'npm ci'
          bat 'npx prisma generate'
        }
      }
    }

    stage('Backend Test') {
      steps {
        dir('backend') {
          bat 'npm test -- --runInBand'
        }
      }
    }

    stage('Backend Build') {
      steps {
        dir('backend') {
          bat 'npm run build'
        }
      }
    }

    stage('Client Install') {
      steps {
        dir('client') {
          bat 'npm ci'
        }
      }
    }

    stage('Client Build') {
      steps {
        dir('client') {
          bat 'npm run build'
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'client/dist/**, backend/dist/**', allowEmptyArchive: true
    }
  }
}
