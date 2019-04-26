import "./app/styles/main.scss";
import "foundation-sites";
import {Aurelia, Container} from "aurelia-framework";
import {configure as configureAureliaDialog, DialogConfiguration} from "aurelia-dialog";
import {default as $} from "jquery";
import {PLATFORM} from "aurelia-pal";
import Pace from "pace-progress";

export async function configure(aurelia: Aurelia) {
    if (!window.localStorage.getItem("token") && window.location.pathname !== "/login") {
        const returnPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?return=${returnPath}`;

        return;
    }

    // Progressbar.
    Pace.start();

    aurelia.use.standardConfiguration()
        .plugin(configureAureliaDialog, (dialogConfig: DialogConfiguration) => {
            dialogConfig.useDefaults();
            dialogConfig.settings.startingZIndex = 1005;
        });

    if (GG_APP_ENV === "development") {
        aurelia.use.developmentLogging();
    }

    configureContainer(aurelia.container);

    await aurelia.start();
    await aurelia.setRoot(PLATFORM.moduleName("app/view-models/app"));

    // Foundation.
    $("#topBarMain").foundation();
    $("#offCanvasLeft").foundation();

    $("#toggleOffCanvasLeft").on("click", () => {
        $("#offCanvasLeft").toggleClass("reveal-for-large");
    });
}

function configureContainer(_container: Container) {
    // ... removed.
}
