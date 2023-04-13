rm -rf /tmp/yao-admin/*

mkdir -p /tmp/yao-admin

cp -r ../yao-admin/* /tmp/yao-admin/

cd /tmp/yao-admin

./cleanup.sh

yao start