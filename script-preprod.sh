#!/bin/bash
 
cd WEBSITE;ng build;cd ..

rm -Rf docs/;  
cp WEBSITE/dist/* ./docs
