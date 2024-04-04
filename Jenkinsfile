pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'v = 16 Building..'
		sh 'cd WEBSITE/; ls; /usr/local/bin/npm install ' 
		
		
		
		
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