/**
 * utility class for handling a bunch of reuseable ids
 */
export class IdPool {
  private counter = 0;

  private free: number[] = [];

  /**
   * check out a new id
   * @return {*}
   */
  checkOut() {
    if (this.free.length === 0) {
      // no more cached
      return this.counter++;
    }
    return this.free.shift();
  }

  /**
   * returns an id again
   * @param id
   */
  checkIn(id: number) {
    // returned the last one, can decrease the counter
    if (id === this.counter - 1) {
      this.counter--;
    } else {
      this.free.push(id);
    }
  }

  /**
   * whether the given id is used
   * @param id
   * @return {boolean}
   */
  isCheckedOut(id: number) {
    // smaller than counter and not a free one
    return id < this.counter && this.free.indexOf(id) < 0;
  }

  /**
   * return the number of checked out ids
   * @return {number}
   */
  get size() {
    return this.counter - this.free.length;
  }
}
