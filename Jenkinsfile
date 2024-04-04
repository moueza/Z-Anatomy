pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'v13 Building..'
		cd WEBSITE/
		npm install
		ng build
		
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}