import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

import EmailService from "./EmailService";

// for some reason atob is working in the old remix app but not
// the "restack". 🤷🏻 Chatgpt gave me this alternative and it works.
const atob = (bodyData: string | null | undefined) => Buffer.from(bodyData ?? "", "base64").toString("utf-8");

export default class GmailService extends EmailService {
  constructor(private authClient: OAuth2Client) {
    super();
  }

  private emailData?: {
    html: string, date: Date | undefined
  };

  private get messageBody() {
    return this.emailData?.html;
  }

  private get messageDate() {
    return this.emailData?.date ?? null;
  }

  public async getMessageBody(): Promise<string> {
    if (!this.messageBody) {
      await this.getEmailData();
    }
    return this.messageBody ?? "Could not get message body?";
  }

  public async getMessageDate(): Promise<Date | null> {
    if (!this.messageDate) {
      await this.getEmailData();
    }

    return this.messageDate;
  }

  public async getEmailData(): Promise<void> {
    const gmail = google.gmail({ version: "v1", auth: this.authClient });
    const messagesResponse = await gmail.users.messages.list({
      userId: "me",
      q: "subject:(\"Clockwork East Coast - Schedule\")"
    });

    const firstMessageThatStartsAThread = messagesResponse.data.messages?.find(m => m.threadId === m.id);
    if (!firstMessageThatStartsAThread?.id) throw Error("firstMessageThatStartsAThread undefined");

    const message = await gmail.users.messages.get({
      id: firstMessageThatStartsAThread.id,
      userId: "me"
    });
    const messageDate = message.data.internalDate
      ? new Date(Number(message.data.internalDate))
      : undefined;
    const bodyData = message.data.payload?.body?.data;
    const html = atob(bodyData);

    this.emailData = {
      date: messageDate, html
    };
  }
}
