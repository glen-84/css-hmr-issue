// tslint:disable:no-any

// Global constants (defined with webpack).
declare const GG_APP_ENV: string;
declare const GG_API_BASE_URL: string;
declare const GG_API_VERSION: number;
declare const GG_WEBSITE_URL: string;
declare const GG_TIME_ZONE: string;

// JQuery plugins.
declare interface JQuery {
    datetimepicker: any;
    // The types for select2 depend on requirejs types, which then conflict with the types for webpack-env.
    // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/1627 (similar issue)
    select2: any;
    timepicker: any;
}

// Allow HTML templates to be imported.
declare module "*.html" {
    const template: string;
    export default template;
}

// Allow JPEG images to be imported.
declare module "*.jpg" {
    const path: string;
    export default path;
}

declare module "fine-uploader";

/**
 * This is a temporary type that should be replaced once a more appropriate type is available.
 *
 * @see https://www.reddit.com/r/typescript/comments/4p2r6e/type_todo_any_lazy_gradual_typing/
 */
declare type TODO = any;
