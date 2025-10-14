import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway(80, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log(payload);

    return 'Hello world!';
  }

  handleConnection() {
    console.log(`New Client Connected.`);
  }
}
