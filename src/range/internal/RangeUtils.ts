export class RangeUtils {
  static fixRange(v: number, size: number) {
    return v < 0 ? size + 1 + v : v;
  }
}
