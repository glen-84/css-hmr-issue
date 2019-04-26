import {autoinject, useView} from "aurelia-framework";
import {Base} from "../view-models/base";
import {PLATFORM} from "aurelia-pal";
import {Router} from "aurelia-router";

@autoinject
@useView(PLATFORM.moduleName("../views/login.html"))
export class Login extends Base {
    public error: string;
    public message: string;
    public username: string;
    public password: string;

    public constructor(router: Router) {
        super(router);
    }

    public activate() {
        const params = new URLSearchParams(window.location.search.slice(1));

        switch (params.get("message")) {
            case "invalidKey":
                this.message = "Session expired";
                break;
            case "missingKey":
                this.message = "Sign in to continue";
                break;
        }
    }

    public async login(_event: Event): Promise<void> {
        // ... removed.
    }
}
