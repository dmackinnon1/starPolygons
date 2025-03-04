#!/usr/bin/env node


const fs = require('fs');
let spModule = require('./js/starpoly.js');

let output = spModule.starPoly.test;

let fileName = "table.tex"; 

fs.writeFile(fileName, output, function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
		process.exit(1);
    }
}); 

