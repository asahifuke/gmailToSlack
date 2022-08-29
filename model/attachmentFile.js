import {google} from 'googleapis';
import {Slack} from './slack.js';
import fs from 'fs';


export class AttachmentFile {
  constructor(auth, resList, resMes, gmail, part) {
    this.auth = auth
    this.resList = resList
    this.resMes = resMes
    this.gmail = gmail
    this.part = part
  }

  static async getParts(auth, resList, resMes, gmail, parts) {
    return parts.map(part => {
      const attachmentFile = new AttachmentFile(auth, resList, resMes, gmail, part)
      if (attachmentFile.isPartMimeTypePdf()) { return attachmentFile }
      if (attachmentFile.isExistParts()) { AttachmentFile.getParts(auth, resList, resMes, gmail, part.parts)}
    }).filter(Boolean)
  }

  isPartMimeTypePdf() {
    return this.part.mimeType === 'application/pdf'
  }

  getAttachmentId() {
    return this.part.body.attachmentId
  }

  base64DecodeFile(data){
    return new Buffer.from(data, 'base64');
  }

  async getResponse(attachmentId) {
    return await this.gmail.users.messages.attachments.get({
      userId: 'me',
      id: attachmentId,
      messageId: this.lastMessage().id,
    })
  }

  async writePdf() {
    if (this.getAttachmentId()) {
      const response = await this.getResponse(this.getAttachmentId());
      fs.writeFile(`./files/download.pdf`, await this.base64DecodeFile(await response.data.data), (err) => {
        if (err) return console.error(err);
      });
    }
  }

  async send() {
    await this.writePdf()
    new Slack(
      './files/download.pdf', 
      // 'hr_rng23_is_fuke', 
      'test2',
      'https://slack.com/api/files.upload', 
      'POST', 
      '@Ayana Takahashi お疲れ様です！フィヨルドブートキャンプの請求書です。よろしくお願い致します。'
    ).send()
  }

  lastMessage() {
    return this.resList.data.messages[0];
  }

  isExistParts() {
    return this.part.parts
  }
}
