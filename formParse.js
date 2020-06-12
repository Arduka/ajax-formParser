module.exports = function formParse(body, boundary) {
    //将Buffer类型的数据转化成binary编码格式的字符串
    let formStr = Buffer.concat(body).toString('binary');
    let formarr = formStr.split(boundary);
    //去掉首尾两端的无用字符
    formarr.shift();
    formarr.pop();
    //存储普通key-value
    let filed = {};
    //存储文件信息
    let file = {};
    for (let item of formarr) {
        //去除首尾两端的非信息字符
        item = item.slice(0, -2).trim();
        //value存储input输入的值
        let value = '';
        //不同操作系统换行符不同,用变量a声明特殊分割点位的下标
        let a;
        if ((a = item.indexOf('\r\n\r\n')) != -1) {
            value = item.slice(a + 4);
        } else if ((a = item.indexOf('\r\r')) != -1) {
            value = item.slice(a + 2);
        } else if ((a = item.indexOf('\n\n')) != -1) {
            value = item.slice(a + 2);
        }
        //正则匹配，组中内容
        let key = item.match(/name="([^"]+)"/)[1];
        if (item.indexOf('filename') == -1) {
            if (!(key in filed)) {
                //将二进制字符串转化成utf8格式的字符串
                filed[key] = Buffer.from(value,'binary').toString('utf8');
            } else {
                //将复选框的数据放入一个数组中
                let arr = [];
                filed[key] = arr.concat(filed[key], value);
            }
        } else {
            let filename_b = item.match(/filename="([^"]*)"/)[1];
            //解决中文文件名乱码的问题
            let filename = Buffer.from(filename_b,'binary').toString();
            let contentType = item.slice(item.indexOf('Content-Type:'), a);
            let obj = {};
            obj.filename = filename;
            obj.contentType = contentType;
            obj.binaryStream = value;//文件的二进制数据
            let arr = [];
            if (!(key in file)) {
                arr.push(obj);
                file[key] = arr;
            } else {
                //用于多文件上传
                file[key] = arr.concat(file[key], obj);
            }
        }
    }
    return { filed, file };
}