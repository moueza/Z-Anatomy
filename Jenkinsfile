pipeline {
    agent any

    stages {
        





stage('Build') {
        steps {
           script{
             if(params.SKIP_TESTS){
	     
               sh 'cd WEBSITE/;rm -Rf dist; npm install'
               sh 'cd WEBSITE/;npm run build:${ENV}'
             }else{
               sh 'cd WEBSITE/;rm -Rf dist;ls;npm install'
               sh 'cd WEBSITE/;npm run test'
               sh 'cd WEBSITE/;npm run build:${ENV}'
                    }
                  }
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