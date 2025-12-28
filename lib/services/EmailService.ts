export default class EmailService {
  public async getMessageBody(): Promise<string> {
    throw new Error('getMessageBody not implemented')
  }
  public getMessageDate(): Promise<Date | null> {
    throw new Error('messageDate not implemented')
  }
}
