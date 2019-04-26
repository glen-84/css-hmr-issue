import {computedFrom} from "aurelia-framework";
import {default as $} from "jquery";
import {Router} from "aurelia-router";
import generateMergePatch from "json-merge-patch/lib/generate";
import toastr from "toastr";

export abstract class Base {
    protected router: Router;

    protected activity = {};
    protected actionUrls;

    public constructor(router: Router) {
        this.router = router;
    }

    @computedFrom("router.currentInstruction.fragment", "router.currentInstruction.queryString")
    public get activePage(): string {
        if (this.router.currentInstruction.queryString === "") {
            return this.router.currentInstruction.fragment;
        } else {
            return `${this.router.currentInstruction.fragment}?${this.router.currentInstruction.queryString}`;
        }
    }

    public async onFilter(event: CustomEvent) {
        await this.router.navigate(event.detail.url);
    }

    protected handleError(_error: Error, _form?: HTMLFormElement): void {
        // ... removed.
    }

    /**
     * @param message     A success message
     * @param form        The form that was used to submit the data
     * @param useReturn   Whether or not to use the return URL if it is available
     */
    protected async handleSuccess(message: string, form: HTMLFormElement, useReturn = true): Promise<void> {
        // Show success message.
        this.showSuccess(message);

        if (form) {
            // Clear any existing validation errors.
            this.clearValidationErrors(form);
        }

        // Which action to perform (close, new, or none) after successfully saving data.
        const actionAfter = (form.dataset["actionAfter"] as ActionAfter);

        switch (actionAfter) {
            case "close":
                // Return to previous page or specific "close" URL.
                const returnPath = this.getReturnPath();

                if (returnPath && useReturn) {
                    await this.router.navigate(returnPath);
                } else {
                    if (this.actionUrls["close"]) {
                        await this.router.navigate(this.actionUrls["close"]);
                    } else {
                        throw new Error("Action URL for 'close' not set");
                    }
                }

                break;
            case "new":
                // Redirect to add new.
                if (this.actionUrls["new"]) {
                    let url;
                    if (this.actionUrls["new"] === window.location.pathname) {
                        // Aurelia will not navigate unless the URL is different, so add something to the query string.
                        url = new URL(this.actionUrls["new"], window.location.origin);
                        url.searchParams.set("timestamp", Date.now());
                    } else {
                        url = this.actionUrls["new"];
                    }

                    await this.router.navigate(url);
                } else {
                    throw new Error("Action URL for 'new' not set");
                }

                break;
            case "none":
            case undefined:
                // No action.
                break;
            default:
                throw new Error(`Unknown action "${actionAfter}"`);
        }
    }

    protected renderValidationErrors(form: HTMLFormElement, errors: {}): void {
        // tslint:disable-next-line:forin -- "errors" will not have any inherited properties.
        for (const fieldName in errors) {
            const field = form.querySelector(
                `input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`
            );

            if (field === null) {
                continue;
            }

            const formGroup = field.closest(".form-group");

            if (formGroup === null) {
                continue;
            }

            formGroup.classList.add("has-error");

            // Label.
            const parent = field.parentElement;

            if (parent !== null && parent.nodeName === "LABEL") {
                parent.classList.add("is-invalid-label");
            } else {
                const id = field.id;

                if (id) {
                    $(`label[for="${id}"]`).addClass("is-invalid-label");
                }
            }

            // Input.
            field.classList.add("is-invalid-input");

            // Messages.
            const $formGroup = $(formGroup);

            for (const msg of errors[fieldName]) {
                $formGroup.append(`<span class="form-error is-visible">&bull; ${msg}</span>`);
            }
        }
    }

    protected clearValidationErrors(form: HTMLFormElement): void {
        // Labels.
        $(".is-invalid-label", form).removeClass("is-invalid-label");

        // Inputs.
        $(".is-invalid-input", form).removeClass("is-invalid-input");

        // Messages.
        $(".form-error", form).remove();
    }

    protected showError(message: string): void {
        this.showMessage("error", message);
    }

    protected showInfo(message: string): void {
        this.showMessage("info", message);
    }

    protected showSuccess(message: string): void {
        this.showMessage("success", message);
    }

    protected showWarning(message: string): void {
        this.showMessage("warning", message);
    }

    protected showMessage(type: MessageType, message: string): void {
        toastr[type](message, "", {positionClass: "toast-top-center"});
    }

    /**
     * Return to previous page or specific "close" URL.
     */
    protected async cancel(): Promise<void> {
        const returnPath = this.getReturnPath();

        if (returnPath) {
            await this.router.navigate(returnPath);
        } else {
            if (this.actionUrls["close"]) {
                await this.router.navigate(this.actionUrls["close"]);
            } else {
                throw new Error("Action URL for 'close' not set");
            }
        }
    }

    protected getMergePatch(source, target) {
        // Note: This is experimental, and might not work well for array element addition/removal.
        return generateMergePatch(source, target);
    }

    protected checkChanges(original, current): boolean {
        if (this.getMergePatch(original, current) === undefined) {
            // No changes.
            return true;
        }

        return confirm("You have unsaved changes. Are you sure you wish to leave?");
    }

    protected noChanges(activityKey: string): void {
        this.showInfo("Nothing to save (no changes)");
        this.activity[activityKey] = false;
    }

    /**
     * Get the value of the `return` parameter in the query string. Used for redirecting to the previous page.
     */
    protected getReturnPath(defaultPath: string | null = null): string | null {
        const params = new URLSearchParams(window.location.search.slice(1));
        const returnPath = params.get("return");

        if (returnPath === null) {
            return defaultPath;
        }

        try {
            const url = new URL(returnPath, window.location.href);

            // The return path/URL must be on the same host.
            if (url.hostname === window.location.hostname) {
                return returnPath;
            }

            return defaultPath;
        } catch (e) {
            return defaultPath;
        }
    }

    // tslint:disable-next-line:no-any -- JSON.parse returns `any`.
    protected clone(obj: {}): any {
        // See: http://stackoverflow.com/a/5344074/221528
        return JSON.parse(JSON.stringify(obj));
    }
}

type ActionAfter = ("close" | "new" | "none");

type MessageType = ("error" | "info" | "success" | "warning");
