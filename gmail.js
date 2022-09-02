#!/usr/bin/env node

import { AttachmentFile } from './model/attachmentFile.js';
import { Slack } from './model/slack.js';
import dotenv from 'dotenv';
import program from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';
dotenv.config();

program.parse(process.argv);
const q = program.args[0];
const channel = program.args[1];
const message = program.args[2];
const credentials_path = program.args[3];
const slack_token = program.args[4];

// fs.readFile(this.client_secret_path, (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   this.#authorize(JSON.parse(content));
// });
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = credentials_path; // path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function createAttachmentFiles(gmail, resMes, lastMessage) {
  return await AttachmentFile.getParts(
    gmail, 
    await resMes.data.payload.parts, 
    await lastMessage
  );
}

function sendSlack() {
  new Slack(
    './files/download.pdf', 
    channel,
    'https://slack.com/api/files.upload', 
    'POST', 
    message,
    slack_token
  ).send();
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const resList = await gmail.users.messages.list({userId: 'me', q: q});
  const lastMessage = resList.data.messages[0];
  const resMes = await gmail.users.messages.get({ userId: 'me', id: lastMessage.id, format: 'FULL'});
  const attachmentFiles = await createAttachmentFiles(gmail, resMes, lastMessage);
  attachmentFiles.map(async attachmentFile =>{ 
    await attachmentFile.writePdf('./files/download.pdf');
    sendSlack();
  });
}
authorize().then(listLabels).catch(console.error);
