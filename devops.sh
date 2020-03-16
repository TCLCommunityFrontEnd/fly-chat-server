
zip -ro chat-server.zip ./;

sudo scp -i /local/sda/mykeypairOfSingapore.pem -r chat-server.zip  ubuntu@3.1.103.172:/home/ubuntu;
sudo rm -rf chat-server.zip;

# ssh ubuntu@3.1.103.172 -i /local/sda/mykeypairOfSingapore.pem  << eeooff
# cd /home/ubuntu
# unzip tcl-cloud.zip 

# if [ -d "/var/www/html/tcl-cloud" ];then
# sudo rm -rf /var/www/html/tcl-cloud
# fi
# sudo mv /home/ubuntu/src /var/www/html/tcl-cloud
# exit
# eeooff

