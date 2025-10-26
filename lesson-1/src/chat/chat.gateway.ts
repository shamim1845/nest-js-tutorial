import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ChatUser {
  clientId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  users: ChatUser[] = [];

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
    this.users.push({
      clientId: client.id,
    });
    console.log(this.users);
    // Broadcast to every connected client
    this.server.emit('activeUser', this.users);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client Disconnected. id: ${client.id}`);
    this.users = this.users.filter(
      (user: ChatUser) => user.clientId !== client.id,
    );
    console.log(this.users);
    // Broadcast to every connected client
    this.server.emit('activeUser', this.users);
  }
}
