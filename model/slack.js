import fetch, { FormData, fileFromSync } from 'node-fetch';
import fs from 'fs';

export class Slack {
  constructor(filePath, channelName, uri, method, message) {
    this.filePath = filePath
    this.channelName = channelName
    this.uri = uri
    this.method = method
    this.message = message
  }

  send() {
    fs.readFile(this.filePath, (err, token) => {
      const form = new FormData();
      form.append('file', fileFromSync(this.filePath));
      form.append('channels', this.channelName);
      form.append('initial_comment', this.message);

      fetch(this.uri, {
        method: this.method,
        headers: {
            'Authorization': `Bearer ${process.env.SLACK_TOKEN}`
        },
        body: form
      });
    });
  }
}

