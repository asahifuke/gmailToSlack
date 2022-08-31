#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';
import {google} from 'googleapis';
import { AttachmentFile } from './model/attachmentFile.js';
import { Slack } from './model/slack.js';
import dotenv from 'dotenv';
import program from 'commander';
dotenv.config();

class Gmail {
  constructor(q, channel, messages) {
    this.scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    this.client_secret_path = './client_secret_248895458266-rq0lf1gdi4rcb02lks08uhi1ic0u1n7i.apps.googleusercontent.com.json';
    this.token_path = 'token.json';
    this.userId = 'me';
    this.q = q;
    this.version = 'v1';
    this.format = 'FULL';
    this.pdfPath = './files/download.pdf';
    this.slackUri = 'https://slack.com/api/files.upload';
    this.channel = channel;
    this.method = 'POST';
    this.messages = messages;
  }

  run() {
    fs.readFile(this.client_secret_path, (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      this.#authorize(JSON.parse(content));
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
      this.#gmailSendSlack(oAuth2Client);
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
          console.log('Token stored to', this.token_path);
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

  async #gmailSendSlack(auth) {
    const gmail = google.gmail({ version: this.version, auth });
    const resList = await gmail.users.messages.list({userId: this.userId, q: this.q});
    const lastMessage = resList.data.messages[0];
    const resMes = await gmail.users.messages.get({ userId: this.userId, id: lastMessage.id, format: this.format});
    this.#sendAttachmentFilesToSlack(gmail,resMes, lastMessage);
  }

  async #sendAttachmentFilesToSlack(gmail,resMes, lastMessage) {
    const attachmentFiles = await this.#createAttachmentFiles(gmail, resMes, lastMessage);
    attachmentFiles.map(async attachmentFile =>{ 
      await attachmentFile.writePdf(this.pdfPath);
      this.#sendSlack();
    });
  }

  async #createAttachmentFiles(gmail, resMes, lastMessage) {
    return await AttachmentFile.getParts(
      gmail, 
      await resMes.data.payload.parts, 
      await lastMessage
    );
  }

  #sendSlack() {
    new Slack(
      this.pdfPath, 
      this.channel,
      this.slackUri, 
      this.method, 
      this.messages
    ).send();
  }
}
// 'フィヨルドブートキャンプからの領収書'
// 'test4'// 'hr_rng23_is_fuke', 
// '@Ayana Takahashi お疲れ様です！フィヨルドブートキャンプの請求書です。よろしくお願い致します。'
program.parse(process.argv);
new Gmail(program.args[0], program.args[1], program.args[2]).run();
