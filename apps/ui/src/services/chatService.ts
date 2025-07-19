import { Observable, Subject, fromEvent, merge } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import {
  ChatRoom,
  ChatMessage,
  ConnectionState,
  DeleteMessageEvent,
  SendMessageRequest,
} from "amazon-ivs-chat-messaging";
import { Message } from "@/atoms/chatAtoms";

export type ChatEvent = 
  | { type: "state"; payload: ConnectionState }
  | { type: "message"; payload: Message }
  | { type: "messageDelete"; payload: string }
  | { type: "error"; payload: string };

export class ChatService {
  private chatRoom: ChatRoom | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private regionOrUrl: string,
    private tokenProvider: () => Promise<{
      token: string;
      sessionExpirationTime: Date;
      tokenExpirationTime: Date;
    }>
  ) {}

  connect(): Observable<ChatEvent> {
    return new Observable((observer) => {
      try {
        this.chatRoom = new ChatRoom({
          regionOrUrl: this.regionOrUrl,
          tokenProvider: this.tokenProvider,
        });

        const connectingEvent$ = fromEvent(this.chatRoom, "connecting").pipe(
          map(() => ({ type: "state" as const, payload: "connecting" as ConnectionState }))
        );

        const connectedEvent$ = fromEvent(this.chatRoom, "connect").pipe(
          map(() => ({ type: "state" as const, payload: "connected" as ConnectionState }))
        );

        const disconnectedEvent$ = fromEvent(this.chatRoom, "disconnect").pipe(
          map(() => ({ type: "state" as const, payload: "disconnected" as ConnectionState }))
        );

        const messageEvent$ = fromEvent<ChatMessage>(this.chatRoom, "message").pipe(
          map((message) => {
            const newMessage: Message = {
              id: message.id,
              content: message.content || "",
              sender: message.sender,
              sendTime: message.sendTime,
            };
            return { type: "message" as const, payload: newMessage };
          })
        );

        const messageDeleteEvent$ = fromEvent<DeleteMessageEvent>(
          this.chatRoom,
          "messageDelete"
        ).pipe(
          map((event) => ({
            type: "messageDelete" as const,
            payload: event.messageId,
          }))
        );

        const errorEvent$ = fromEvent<Error>(this.chatRoom, "error").pipe(
          map((error) => ({
            type: "error" as const,
            payload: error.message || "Unknown error occurred",
          }))
        );

        const events$ = merge(
          connectingEvent$,
          connectedEvent$,
          disconnectedEvent$,
          messageEvent$,
          messageDeleteEvent$,
          errorEvent$
        ).pipe(takeUntil(this.destroy$));

        const subscription = events$.subscribe(observer);

        this.chatRoom.connect();

        return () => {
          subscription.unsubscribe();
          this.disconnect();
        };
      } catch (error) {
        observer.error(error);
      }
    });
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.chatRoom) {
      throw new Error("Chat room not connected");
    }
    const request = new SendMessageRequest(content);
    await this.chatRoom.sendMessage(request);
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chatRoom) {
      this.chatRoom.disconnect();
      this.chatRoom = null;
    }
  }

  isConnected(): boolean {
    return this.chatRoom !== null;
  }
}