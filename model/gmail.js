import {google} from 'googleapis';
import { Slack } from './slack.js';

export class Gmail {
  constructor(auth, resList, resMes, gmail) {
    this.auth = auth
    this.resList = resList
    this.resMes = resMes
    this.gmail = gmail
  }

  createSlack(message) {
    return new Slack(
      process.env.SLACK_URI, 
      'POST', 
      'application/x-www-form-urlencoded',
      message
    )
  }
}