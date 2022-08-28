import { Part } from './part.js';
import {google} from 'googleapis';
import fs from 'fs';
import fetch, { FormData, fileFromSync } from 'node-fetch';

export class AttachmentFile extends Part {
  constructor(auth, resList, resMes, gmail, part) {
    super(auth, resList, resMes, gmail, part)
  }

  static async getParts(auth, resList, resMes, gmail, parts) {
    return parts.map(part => {
      const attachmentFile = new AttachmentFile(auth, resList, resMes, gmail, part)
      if (attachmentFile.isPartMimeTypePng()) { return attachmentFile }
      if (attachmentFile.isExistParts()) { return AttachmentFile.getParts(auth, resList, resMes, gmail, part.parts)}
    }).filter(Boolean)
  }


   isPartMimeTypePng() {
    return this.part.mimeType === 'image/png'
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

  

  async require() {
    if (this.getAttachmentId()) {
      const response = await this.getResponse(this.getAttachmentId());
      fs.writeFile(`./files/download.png`, await this.base64DecodeFile(await response.data.data), (err) => {
        if (err) return console.error(err);
      });
    }
  }

  async send() {
    await this.require()
    fs.readFile('./files/download.png', (err, token) => {
      const form = new FormData();
      form.append('file', fileFromSync('./files/download.png'));
      form.append('channels', 'test2');

      fetch('https://slack.com/api/files.upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.SLACK_TOKEN}`
        },
        body: form
      });
    });
  }

  lastMessage() {
    return this.resList.data.messages[0];
  }
}