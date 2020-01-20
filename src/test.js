const http = require('hsnode').http;

http.get('http://10.0.0.101:88/cgi-bin/CGIProxy.fcgi?usr=doggie&pwd=a3c-woof-!Yo&cmd=setFtpConfig&ftpAddr=ftp://10.0.0.100/recordings/&ftpPort=2127&mode=0&userName=one&password=two')
.then(res => console.log(res.data));