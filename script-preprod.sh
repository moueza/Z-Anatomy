#!/bin/bash
 
cd WEBSITE;ng build;cd ..

rm -Rf docs/;  mkdir docs
cp WEBSITE/dist/ ./docs
