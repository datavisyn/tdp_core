export class Token {
  constructor(public type: number, public text: any) {}

  typeis(t: number) {
    return this.type === t;
  }
}
