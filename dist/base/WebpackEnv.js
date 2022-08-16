export class WebpackEnv {
}
WebpackEnv.NODE_ENV = process.env.NODE_ENV;
WebpackEnv.__VERSION__ = process.env.__VERSION__;
WebpackEnv.__LICENSE__ = process.env.__LICENSE__;
WebpackEnv.__BUILD_ID__ = process.env.__BUILD_ID__;
WebpackEnv.__APP_CONTEXT__ = process.env.__APP_CONTEXT__;
WebpackEnv.__DEBUG__ = process.env.__DEBUG__;
/**
 * enables features that used in reprovisyn
 */
WebpackEnv.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES = process.env.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES === 'true';
//# sourceMappingURL=WebpackEnv.js.map