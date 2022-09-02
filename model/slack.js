import fetch, { FormData, fileFromSync } from 'node-fetch';
import fs from 'fs';

export class Slack {
  constructor(filePath, channelName, uri, method, message, slack_token) {
    this.filePath = filePath;
    this.channelName = channelName;
    this.uri = uri;
    this.method = method;
    this.message = message;
    this.slack_token = slack_token;
  }

  send() {
    fs.readFile(this.filePath, () => {
      const form = new FormData();
      form.append('file', fileFromSync(this.filePath));
      form.append('channels', this.channelName);
      form.append('initial_comment', this.message);

      fetch(this.uri, {
        method: this.method,
        headers: {
            'Authorization': `Bearer ${this.slack_token}`
        },
        body: form
      });
    });
  }
}

