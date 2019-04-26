import {autoinject, useView} from "aurelia-framework";
import {PLATFORM} from "aurelia-pal";

@autoinject
@useView(PLATFORM.moduleName("../views/index.html"))
export class Index {

}
