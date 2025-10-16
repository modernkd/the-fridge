import type * as Party from 'partykit/server';

console.log('PartyKit server.ts loaded');

interface User {
  id: string;
  name: string;
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {
    console.log(`Server constructor called for room: ${this.room.id}`);
  }

  users: Map<string, User> = new Map();

  onConnect() {
    try {
      console.log(`Connected: room: ${this.room.id}`);
    } catch {
      // console.error(`Error in onConnect`);
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    console.log(`Received message from ${sender.id}: ${message}`);
    try {
      const data = JSON.parse(message);
      console.log(`Parsed data:`, data);
      if (data.type === 'join') {
        this.users.set(sender.id, { id: sender.id, name: data.name });
        console.log(`${data.name} joined room ${this.room.id}`);
        // Send existing custom sounds to the new user
        await this.sendExistingCustomSounds(sender);
        // Send current users list to new user
        sender.send(
          JSON.stringify({
            type: 'usersList',
            users: Array.from(this.users.values()),
          })
        );
        // Broadcast user joined to others
        const joinMsg = JSON.stringify({
          type: 'userJoined',
          user: { id: sender.id, name: data.name },
        });
        for (const conn of this.room.getConnections()) {
          if (conn !== sender) {
            conn.send(joinMsg);
          }
        }
      } else if (data.type === 'sound') {
        const user = this.users.get(sender.id);
        if (user) {
          console.log(`${user.name} played sound: ${data.emoji}`);
          // Broadcast sound event
          this.room.broadcast(
            JSON.stringify({
              type: 'soundPlayed',
              user: user,
              emoji: data.emoji,
              sound: data.sound,
            })
          );
        }
      } else if (data.type === 'addCustomSound') {
        const user = this.users.get(sender.id);
        if (user) {
          console.log(`${user.name} added custom sound: ${data.emoji}`);
          // Store in room storage
          await this.room.storage.put(`customSound_${data.emoji}`, data.sound);
          // Broadcast to all users
          this.room.broadcast(
            JSON.stringify({
              type: 'customSoundAdded',
              user: user,
              emoji: data.emoji,
              sound: data.sound,
            })
          );
        }
      } else if (data.type === 'deleteCustomSound') {
        const user = this.users.get(sender.id);
        if (user && data.emoji) {
          console.log(`${user.name} deleted custom sound: ${data.emoji}`);
          await this.room.storage.delete(`customSound_${data.emoji}`);
          // Broadcast deletion to all users
          this.room.broadcast(
            JSON.stringify({
              type: 'customSoundDeleted',
              emoji: data.emoji,
            })
          );
        }
      } else if (data.type === 'editCustomSound') {
        const user = this.users.get(sender.id);
        if (user && data.emoji && data.sound) {
          console.log(`${user.name} edited custom sound: ${data.emoji}`);
          await this.room.storage.put(`customSound_${data.emoji}`, data.sound);
          // Broadcast update to all users
          this.room.broadcast(
            JSON.stringify({
              type: 'customSoundUpdated',
              user: user,
              emoji: data.emoji,
              sound: data.sound,
            })
          );
        }
      }
    } catch {
      // console.error("Error in onMessage");
      // console.error("Invalid message:", message);
    }
  }

  async sendExistingCustomSounds(conn: Party.Connection) {
    // Get all custom sounds from storage
    const keys = await this.room.storage.list();
    for (const [key, value] of keys) {
      if (key.startsWith('customSound_')) {
        const emoji = key.replace('customSound_', '');
        conn.send(
          JSON.stringify({
            type: 'customSoundAdded',
            emoji,
            sound: value,
          })
        );
      }
    }
  }

  onClose(conn: Party.Connection) {
    const user = this.users.get(conn.id);
    if (user) {
      this.users.delete(conn.id);
      console.log(`${user.name} left room ${this.room.id}`);
      // Broadcast user left
      this.room.broadcast(
        JSON.stringify({
          type: 'userLeft',
          user: user,
        })
      );
    }
  }
}

Server satisfies Party.Worker;
