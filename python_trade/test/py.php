<?php
$params = "value"; #传递给python脚本的入口参数 
$path="C:\Windows\python-3.8.3-embed-win32\python ".dirname(__FILE__)."\call.py "; //需要注意的是：末尾要加一个空格
@passthru($path.$params);
echo $path.$params;