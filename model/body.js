export class Body {
  constructor(content) {
    this.content = content
  }

  createBuffer() {
    return new Buffer.from(this.content.data, 'base64').toString()
  }

  isExistBody() {
    return this.content.size > 0
  }
  async require() {
    if (this.isExistBody()) { return await createBuffer(); }
  }

}
