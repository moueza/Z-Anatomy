#!/bin/bash
 
cd WEBSITE;ng build;cd ..

rm -Rf docs/;  
cp -Rf WEBSITE/dist/* ./docs
