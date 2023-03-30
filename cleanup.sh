
kill -9 $(ps aux | grep 'yao' | awk '{print $2}')

rm -rf logins/*
rm -rf logs/*



find models/ -not -path "models/" -not -path "models/sys*"   | xargs rm -rf
find tables/ -not -path "tables/" -not -path "tables/sys*" | xargs rm -rf
find forms/ -not -path "forms/" -not -path "forms/sys*" | xargs rm -rf
find flows/ -not -path "flows/" -not -path "flows/sys*" | xargs rm -rf
find charts/ -not -path "charts/" -not -path "charts/sys*" | xargs rm -rf

# rm -rf .env
rm -rf .trash/*
rm -rf db/*

mkdir -p tables/app
mkdir -p tables/sys

mkdir -p forms/app
mkdir -p forms/sys

mkdir -p flows/app
mkdir -p flows/sys
mkdir -p models/app
mkdir -p models/sys
mkdir -p charts/app
mkdir -p charts/sys

# rm -rf ./app.json

# yao studio run model.Create
# yao start

# yao studio run model.CreateOne cms.subject.product.relation

# yao studio run model.Create

# yao run schemas.default.TableGet cms_help

# yao run schemas.default.TableGet cms_help