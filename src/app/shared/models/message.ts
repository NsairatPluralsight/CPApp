export class Message {
  time = 0;
  messageID: string;
  source: string;
  correlationId: string;
  topicName: string;
  payload: any;
}
