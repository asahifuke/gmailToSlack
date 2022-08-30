import fs from 'fs';

export class AttachmentFile {
  constructor(gmail, part, lastMessage) {
    this.gmail = gmail
    this.part = part
    this.lastMessage = lastMessage
  }

  static async getParts(gmail, parts, lastMessage) {
    return parts.map(part => {
      const attachmentFile = new AttachmentFile(gmail, part, lastMessage)
      if (attachmentFile.#isPartMimeTypePdf()) { return attachmentFile }
      if (attachmentFile.#isExistParts()) { AttachmentFile.getParts(gmail, part.parts, lastMessage)}
    }).filter(Boolean)
  }

  async writePdf(path) {
    if (this.#getAttachmentId()) {
      const response = await this.#getResponse();
      fs.writeFile(path, await this.#base64DecodeFile(await response.data.data), (err) => {
        if (err) return console.error(err);
      });
    }
  }

  #isPartMimeTypePdf() {
    return this.part.mimeType === 'application/pdf'
  }

  #getAttachmentId() {
    return this.part.body.attachmentId
  }

  #base64DecodeFile(data){
    return new Buffer.from(data, 'base64');
  }

  async #getResponse() {
    return await this.gmail.users.messages.attachments.get({
      userId: 'me',
      id: this.#getAttachmentId(),
      messageId: this.lastMessage.id,
    })
  }

  #isExistParts() {
    return this.part.parts
  }
}

