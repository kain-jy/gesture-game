import { atom } from "jotai";
import { ConnectionState } from "amazon-ivs-chat-messaging";

export interface Message {
  id: string;
  content: string;
  sender: {
    userId: string;
    attributes?: Record<string, string>;
  };
  sendTime: Date;
}

export const messagesAtom = atom<Message[]>([]);

export const connectionStateAtom = atom<ConnectionState>("disconnected");

export const errorAtom = atom<string>("");

export const usernameAtom = atom<string>("");

export const chatTokenAtom = atom<string>("");

export const isLoadingTokenAtom = atom<boolean>(false);