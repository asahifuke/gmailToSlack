import {Gmail} from "./gmail.js";

export class Header extends Gmail {
  constructor(auth, resList, resMes, gmail, name) {
    super(auth, resList, resMes, gmail)
    this.name = name
  }

  isHeaderNameAsName(header) {
    return header.name.toLowerCase() === this.name;
  }

  async require() {
    const resMes = await this.resMes
    return await resMes.data.payload.headers.map(header => { if (this.isHeaderNameAsName(header)) { return header.value} }).filter(Boolean)[0]
  }

  async send() {
    this.createSlack(
      await this.require()
    ).send()
  }
}
