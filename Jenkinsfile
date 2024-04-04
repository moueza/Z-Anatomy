pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'v = 18 Building..'
		sh 'cd WEBSITE/; ls; sudo -S /usr/local/bin/npm install ' 
		
		
		
		
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