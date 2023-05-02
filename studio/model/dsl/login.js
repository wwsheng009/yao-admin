// import { Studio } from "yao-node-client";
/**
 * yao studio run model.dsl.login.Create
 */
function Create() {
    const fname = "admin.login.json";
    const dsl = {
        name: "::Admin Login",
        action: {
            process: "yao.login.Admin",
            args: [":payload"],
        },
        layout: {
            entry: "/x/Chart/dashboard",
            slogan: "::Make Your Dream With Yao App Engine",
            site: "https://yaoapps.com?from=yao-admin",
        },
    };
    Studio("model.file.MoveAndWrite", "logins", fname, dsl);
}
