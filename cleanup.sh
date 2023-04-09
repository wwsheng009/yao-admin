
kill -9 $(ps aux | grep 'yao' | awk '{print $2}')

rm -rf logins/*
rm -rf logs/*

find models/ -not -path "models/" -not -path "models/ddic*"   | xargs rm -rf
find tables/ -not -path "tables/" -not -path "tables/ddic" | xargs rm -rf
find forms/ -not -path "forms/" -not -path "forms/ddic" | xargs rm -rf
find lists/ -not -path "lists/" -not -path "lists/ddic/option.list.json" -not -path "lists/ddic/validation.list.json" | xargs rm -rf

find flows/ -not -path "flows/" | xargs rm -rf
find charts/ -not -path "charts/"| xargs rm -rf

# rm -rf .env
rm -rf .trash/*
rm -rf db/*

rm -rf studio/types.js

rm -rf .env

# yao studio run model.Create
# yao start

# yao studio run model.CreateOne cms.subject.product.relation

# yao studio run model.Create

# yao run schemas.default.TableGet cms_help

# yao run schemas.default.TableGet cms_help