#!/bin/bash
 
cd WEBSITE;ng build;cd ..

rm -rf docs/;  
cp WEBSITE/dist/* ./docs
