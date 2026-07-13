const fs=require('fs'); fs.readFileSync('server.js','utf8').split('\n').forEach(l => { if(l.includes('require(') && l.includes('./')) console.log(l.trim()); });
