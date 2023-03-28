
kill -9 $(ps aux | grep 'yao' | awk '{print $2}')

rm -rf charts/*
rm -rf flows/app/*
rm -rf logins/*
rm -rf logs/*
rm -rf models/*
rm -rf tables/*
rm -rf forms/*
# rm -rf .env
rm -rf .trash/*
rm -rf db/*


# rm -rf ./app.json

# yao studio run model.Create
# yao start

# yao studio run model.CreateOne cms.subject.product.relation

# yao studio run model.Create

# yao run schemas.default.TableGet cms_help

# yao run schemas.default.TableGet cms_help