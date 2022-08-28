import {Gmail} from "./gmail.js";

export class Part extends Gmail {
  constructor(auth, resList, resMes, gmail, part) {
    super(auth, resList, resMes, gmail)
    this.part = part
  }
  
  static getParts(auth, resList, resMes, gmail, parts) {
    return parts.map(part => {
      const nowPart = new Part(auth, resList, resMes, gmail, part)
      if (nowPart.isExistParts()) { Part.getParts(auth, resList, resMes, gmail, part.parts) }
      return nowPart
    }).filter(Boolean)
  }

  createBuffer(data) {
    return new Buffer.from(data, 'base64').toString()
  }

  isExistBodyData() {
    return this.part.body.size > 0 && this.part.body.data && this.part.body.mimeType && this.part.body.mimeType === 'text/plain'
  }

  getPartsBody() {
    if (this.isExistBodyData()) { return this.createBuffer(this.part.body.data); }
  }

  isExistPartBodyData() {
    return this.part.mimeType === 'text/plain' && this.createBuffer(this.part.body.data)
  }

  isExistPartBody() {
    return this.part.body && this.getPartsBody()
  }

  isExistParts() {
    return this.part.parts
  }

  content() {
    if (this.isExistPartBodyData()) { 
      return this.createBuffer(this.part.body.data);
    } else if (this.isExistPartBody()) {
       return this.getPartsBody() 
    }
  }

  async send() {
    this.createSlack( 
      this.content()
    ).send()
  }
}