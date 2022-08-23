import fetch from 'node-fetch';

class Slack {
  constructor(url, method, contentType, message) {
    this.url = url
    this.method = method
    this.contentType = contentType
    this.message = message
  }

  send() {
    fetch(this.url, {
      method: this.method,
      headers: {
        'Content-type': this.contentType
      },
      body: JSON.stringify({
        'text': this.message
      })
    });
  }
}

const slack = new Slack(
  'https://hooks.slack.com/services/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', 
  'POST', 
  'application/json',
  'Hello, World!'
)
slack.send()
