const http = require('http');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const querystring = require('querystring');
const formParse = require('./formParse');

const server = http.createServer();
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

server.on('request', async (req, res) => {
    if (req.url == '/ajax') {

        if (req.method == 'GET') {
            let pathName = path.join(__dirname, 'ajax.html');
            let data = await readFile(pathName, 'utf8');
            res.end(data);
        }

        if (req.method == 'POST') {
            // req.setEncoding('binary');
            let body = [];
            let boundary = req.headers['content-type'].split('boundary=')[1];
            //console.log(boundary);
            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', async () => {
                let { filed, file } = formParse(body, boundary);
                console.log(filed);
                console.log(file);
                try {
                    //文件输入框的name="files"
                    let fileArr = file.files;
                    for(let f of fileArr){
                        await writeFile(f.filename, f.binaryStream, 'binary');
                        console.log(`文件\"${f.filename}\"写入成功`);
                    }
                } catch (error) {
                    console.log(error);
                    res.statusCode = 500;
                    res.end();
                }
                res.end('请求成功');
            })
        }

    } else {
        res.end('not found');
    }

});

server.listen(8080);
console.log('服务器启动成功');