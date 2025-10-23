import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { text: string }): void {
    console.log({ payload });

    client.emit('message', { text: 'Hello from server' });
    client.broadcast.emit('message', {
      text: 'Hello from server to all other clients',
    });
  }

  handleConnection(client: Socket): void {
    console.log(`New Client Connected. id: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client Disconnected. id: ${client.id}`);
  }
}
