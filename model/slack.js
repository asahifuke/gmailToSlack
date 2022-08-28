import fetch, { FormData, fileFromSync } from 'node-fetch';
import fs from 'fs';

export class Slack {
  constructor(url, method, contentType, message) {
    this.url = url
    this.method = method
    this.contentType = contentType
    this.message = message
  }

  send() {
   
    fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `token=${process.env.SLACK_TOKEN}&channel=#test2&text=${this.message}`
  });

    
  }
}

