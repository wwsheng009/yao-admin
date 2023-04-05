// import { Process, Studio } from "yao-node-client";
// yao studio run model.translate.translate member_id
function translate(keywordsIn) {
    let useTranslate = Process("utils.env.Get", "USE_TRANSLATE");
    if (useTranslate !== "TRUE") {
        return keywordsIn;
    }
    // if (/_id/i.test(keywordsIn)) {
    //   console.log(`id_colume:${keywordsIn}`);
    // }
    let keywords = keywordsIn.split("_");
    let url = "https://brain.yaoapps.com/api/keyword/column";
    let response = Process("xiang.network.PostJSON", url, {
        keyword: keywords,
    }, {});
    let res = keywordsIn;
    if (response.status == 200) {
        if (response.data.data) {
            res = "";
            for (let i in response.data.data) {
                res = res + response.data.data[i]["label"];
            }
        }
    }
    return res;
}
/**
 * 批量翻译
 * yao studio run model.translate.BatchTranslate
 * @param {*} keywords
 * @returns
 */
function BatchTranslate(keywords) {
    let useTranslate = Process("utils.env.Get", "USE_TRANSLATE");
    if (useTranslate !== "TRUE") {
        return keywords;
    }
    // return keywords;
    let url = "https://brain.yaoapps.com/api/keyword/batch_column";
    let response = Process("xiang.network.PostJSON", url, {
        keyword: keywords,
    }, {});
    if (response.status == 200) {
        if (response.data.data) {
            // console.log(response.data.data);
            return response.data.data;
        }
    }
    return keywords;
}
/**
 * Model dsl全部翻译翻译
 * @param {*} keywords
 * @returns
 */
function BatchModel(keywords) {
    let useTranslate = Process("utils.env.Get", "USE_TRANSLATE");
    if (useTranslate !== "TRUE") {
        return keywords;
    }
    const models = keywords;
    models.forEach((model) => {
        model.columns.forEach((col) => {
            col.label = Studio("model.translate.translate", col.label); //col.label.replace(/_id$/i, "");
            // col.name = col.name.replace(/_id$/i, "");
        });
        model.comment = Studio("model.translate.translate", model.name);
        model.table.comment = model.table.name;
        model.table.name = Studio("model.translate.translate", model.table.name);
    });
    return models;
    let url = "https://brain.yaoapps.com/api/keyword/batch_model";
    let response = Process("xiang.network.PostJSON", url, {
        keyword: models,
    }, {});
    if (response.status == 200) {
        if (response.data.data) {
            // console.log(response.data.data);
            return response.data.data;
        }
    }
    return keywords;
}
