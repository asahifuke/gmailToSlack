import fs from 'fs';
import readline from 'readline';
import {google} from 'googleapis';
import { endianness } from 'os';
import { Gmail } from './model/gmail.js'
import { Slack } from './model/slack.js'
import { Header } from './model/header.js'
import { Body } from './model/body.js'
import { AttachmentFile } from './model/attachmentFile.js'
import dotenv from 'dotenv'
import { Part } from './model/part.js';
dotenv.config();


class GmailOAuth {
  constructor() {
    this.scopes = ['https://www.googleapis.com/auth/gmail.readonly']
    this.client_secret_path = '/Users/asahi.fuke/Desktop/client_secret_248895458266-rq0lf1gdi4rcb02lks08uhi1ic0u1n7i.apps.googleusercontent.com.json'
    this.token_path = 'token.json'
  }

  run() {
    fs.readFile(this.client_secret_path, (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      this.#authorize(JSON.parse(content), this.#listLabels);
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */

  #createOAuth2Client(client_id, client_secret, redirect_uris) {
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris);
  }

  #authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = this.#createOAuth2Client(client_id, client_secret, redirect_uris[0]);
    fs.readFile(this.token_path, (err, token) => {
      if (err) return this.#getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */

  #authUrl(oAuth2Client) {
    return oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
    });
  }

  #rl() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  #getNewToken(oAuth2Client, callback) {
    console.log('Authorize this app by visiting this url:', this.#authUrl(oAuth2Client));

    this.#rl().question('Enter the code from that page here: ', (code) => {
      this.#rl().close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        fs.writeFile(this.token_path, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', token_path());
        });
        callback(oAuth2Client);
      });
    });
  }

  /**
   * Lists the labels in the user's account.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async #listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const resList = await gmail.users.messages.list({userId: 'me', q: 'Ferdfaxcdas'});
    const lastMessage = resList.data.messages[0]
    const resMes = await gmail.users.messages.get({
      userId: 'me',
      id: lastMessage.id,
      format: 'FULL'
    });

    new Header(await auth, await resList, await resMes, gmail, 'date').send()

    if (resMes.data.payload.parts) {
      await Part.getParts(auth, resList, resMes, gmail, resMes.data.payload.parts).map(async part => {
        await part.send()
      })
    } else {
      new Body(resMes.data.payload.body).require()
    }
  
    const attachmentFiles = await AttachmentFile.getParts(await auth, await resList, await resMes, gmail, await resMes.data.payload.parts)
    attachmentFiles.map(async attachmentFile =>{
      const nowAttachmentFile = await attachmentFile
      nowAttachmentFile[0].send()
    });
  }
}

new GmailOAuth().run()
