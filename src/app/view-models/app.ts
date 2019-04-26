import {autoinject, useView} from "aurelia-framework";
import {Base} from "../view-models/base";
import {default as $} from "jquery";
import {EventAggregator, Subscription} from "aurelia-event-aggregator";
import {PLATFORM} from "aurelia-pal";
import {Router, RouterConfiguration} from "aurelia-router";

@autoinject
@useView(PLATFORM.moduleName("../views/app.html"))
export class App extends Base {
    public activeUser;
    public year = new Date().getFullYear();
    public activeUserHasSpecialRole = false;

    private readonly ea: EventAggregator;
    private routeNavSuccess: Subscription;

    public constructor(router: Router, ea: EventAggregator) {
        super(router);

        this.ea = ea;
    }

    public getViewStrategy() {
        const guestViews = [
            "/login",
            "/access-denied",
            "/not-found"
        ];

        if (guestViews.indexOf(window.location.pathname) !== -1) {
            return PLATFORM.moduleName("../views/app-guest.html");
        }

        return PLATFORM.moduleName("../views/app.html");
    }

    public async activate() {
        // ... removed access check.

        this.routeNavSuccess = this.ea.subscribe("router:navigation:success", () => {
            // Scroll to the top of the page.
            window.scroll(0, 0);

            // Add "is-active" class to the active navigation link.
            $("#offCanvasLeft > nav li").removeClass("is-active");

            $<HTMLAnchorElement>("#offCanvasLeft > nav a").each((_i, anchor) => {
                if (anchor.href) {
                    if (anchor.pathname === window.location.pathname) {
                        const $anchor = $(anchor);

                        let $li = $anchor.closest("li");
                        while (true) {
                            if ($li.length === 0) {
                                break;
                            }

                            $li.addClass("is-active");

                            if ($li.parent().is(":hidden")) {
                                $li.parent().closest("li").find("> a").trigger("click");
                            }

                            $li = $li.parent().closest("li");
                        }
                    }
                }
            });
        });
    }

    public deactivate() {
        // Dispose subscription.
        this.routeNavSuccess.dispose();
    }

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.title = "CSS HMR issue";

        config.options.pushState = true;
        config.options.compareQueryParams = true;

        config.map([
            // App.
            {
                route: "",
                name: "app.index",
                moduleId: PLATFORM.moduleName("app/view-models/index", "app.index"),
                nav: true,
                title: "Dashboard",
                settings: {
                    icon: "fa fa-dashboard"
                }
            }
        ]);

        this.router = router;
    }

    public logout() {
        window.location.href = "/login";
    }
}
