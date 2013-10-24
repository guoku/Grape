#!/bin/bash
pgrep -f "node ./post_server.js"
if [ $? != 0 ]
then
    cd /home/gkeng/Grape/crawler/
    nohup /usr/local/bin/node ./post_server.js 1>log_post.log 2>log_post_error.log &
fi

pgrep -f "node ./get_server.js"
if [ $? != 0 ]
then
    cd /home/gkeng/Grape/crawler/
    nohup /usr/local/bin/node ./get_server.js 1>log_get.log 2>log_get_error.log &
fi

pgrep -f "node ./image_server.js"
if [ $? != 0 ]
then
    cd /home/gkeng/Grape/crawler/
    nohup /usr/local/bin/node ./image_server.js 1>log_image.log 2>log_image_error.log &
fi
