#!/bin/bash
 
cd WEBSITE;npm install;ng build;cd ..

rm -Rf docs;  
cp -Rf WEBSITE/dist/z-anatomy ./docs
