export class WebpackEnv {
  public static NODE_ENV = process.env.NODE_ENV;

  public static __VERSION__ = process.env.__VERSION__;

  public static __LICENSE__ = process.env.__LICENSE__;

  public static __BUILD_ID__ = process.env.__BUILD_ID__;

  public static __APP_CONTEXT__ = process.env.__APP_CONTEXT__;

  public static __DEBUG__ = process.env.__DEBUG__;

  /**
   * enables features that used in reprovisyn
   */
  public static ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES = process.env.ENABLE_EXPERIMENTAL_REPROVISYN_FEATURES === 'true';
}
