const r=await fetch('http://127.0.0.1:8080/');console.log(JSON.stringify({development:r.status}));if(!r.ok)process.exitCode=1;
