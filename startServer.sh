echo 'Server is starting django service...'

ps aux | grep manage.py | awk '{print $2}' | xargs sudo kill -9
sudo nohup python3 manage.py runserver 0.0.0.0:5555 &

echo 'Server is starting nginx service...'

sudo nginx -s stop
sudo nginx -p /home/user/Corsface -c conf/nginx.conf

echo 'Finished!'

