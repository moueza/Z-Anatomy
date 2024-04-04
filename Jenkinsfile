pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'v = 14 Building..'
		sh 'cd WEBSITE/; ls; npm install;ng build ' 
		
		
		
		
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