import {PLATFORM} from "aurelia-pal";
import {useView} from "aurelia-framework";

@useView(PLATFORM.moduleName("../views/not-found.html"))
export class NotFound {
    public return(): void {
        window.location.href = "/";
    }
}
