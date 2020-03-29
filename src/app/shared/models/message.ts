export class Message {
  public time = 0;
  public messageID: string;
  public source: string;
  public correlationId: string;
  public topicName: string;
  public payload: any;
}
