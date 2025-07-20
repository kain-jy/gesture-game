import { atom } from "jotai";

export interface CurrentTheme {
  theme: string;
  sessionId: string;
  timestamp: Date;
}

// 現在のテーマ情報を全ユーザーで共有
export const currentThemeAtom = atom<CurrentTheme | null>(null);

// Result APIの結果を保存
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const themeResultAtom = atom<any>(null);

// ポーリング状態を管理
export const isPollingAtom = atom<boolean>(false);