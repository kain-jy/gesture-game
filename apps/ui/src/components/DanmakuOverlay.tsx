"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/atoms/chatAtoms";

interface BulletMessage extends Message {
  id: string;
  animationId: string;
  lane: number;
  color: string;
  size: "small" | "medium" | "large";
}

interface DanmakuOverlayProps {
  messages: Message[];
}

const LANES = 8; // 弾幕のレーン数
const LANE_HEIGHT = 45; // 各レーンの高さ
const ANIMATION_DURATION = 6; // アニメーション時間（秒）- CSSと同期

export default function DanmakuOverlay({ messages }: DanmakuOverlayProps) {
  const [activeBullets, setActiveBullets] = useState<BulletMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationCounterRef = useRef(0);
  const lastMessageIdRef = useRef<string>("");
  const laneOccupancyRef = useRef<boolean[]>(new Array(LANES).fill(false));

  const getAvailableLane = useCallback((): number => {
    // 利用可能なレーンを探す
    for (let i = 0; i < LANES; i++) {
      if (!laneOccupancyRef.current[i]) {
        laneOccupancyRef.current[i] = true;
        // アニメーション時間後にレーンを解放
        setTimeout(() => {
          laneOccupancyRef.current[i] = false;
        }, ANIMATION_DURATION * 1000);
        return i;
      }
    }
    // 全レーンが使用中の場合はランダムに選択
    const randomLane = Math.floor(Math.random() * LANES);
    return randomLane;
  }, []);

  const createBulletMessage = useCallback(
    (message: Message): BulletMessage => {
      const colors = [
        "#FFFFFF",
        "#FFE66D",
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#A8E6CF",
        "#DDA0DD",
        "#F8B195",
        "#C7CEEA",
      ];

      const sizes: ("small" | "medium" | "large")[] = [
        "small",
        "medium",
        "medium",
        "large",
      ];
      const lane = getAvailableLane();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];

      return {
        ...message,
        animationId: `bullet-${animationCounterRef.current++}`,
        lane,
        color,
        size,
      };
    },
    [getAvailableLane]
  );

  const addBulletMessage = useCallback(
    (message: Message) => {
      const bulletMessage = createBulletMessage(message);

      setActiveBullets((prev) => [...prev, bulletMessage]);

      setTimeout(() => {
        setActiveBullets((prev) =>
          prev.filter((b) => b.animationId !== bulletMessage.animationId)
        );
      }, ANIMATION_DURATION * 1000);
    },
    [createBulletMessage]
  );

  useEffect(() => {
    console.log("DanmakuOverlay messages updated:", messages.length, messages);
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      console.log("Latest message:", latestMessage);
      if (latestMessage.id !== lastMessageIdRef.current) {
        console.log("Adding new bullet message:", latestMessage.content);
        lastMessageIdRef.current = latestMessage.id;
        addBulletMessage(latestMessage);
      }
    }
  }, [messages, addBulletMessage]);

  // デバッグ用: activeBulletsの状態を監視
  useEffect(() => {
    console.log("Active bullets count:", activeBullets.length, activeBullets);
  }, [activeBullets]);

  const getSizeClasses = (size: "small" | "medium" | "large") => {
    switch (size) {
      case "small":
        return "text-lg px-2 py-1";
      case "medium":
        return "text-2xl px-3 py-1";
      case "large":
        return "text-3xl px-3 py-2";
      default:
        return "text-xl px-3 py-1";
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-50"
    >
      {activeBullets.map((bullet) => (
        <div
          key={bullet.animationId}
          className={`absolute whitespace-nowrap font-bold bullet-animation ${getSizeClasses(
            bullet.size
          )}`}
          style={{
            top: `${bullet.lane * LANE_HEIGHT + 20}px`,
            left: "100%",
            color: bullet.color,
            zIndex: 100,
            fontWeight: "bolder",
          }}
        >
          <span className="bg-opacity-40 rounded-md backdrop-blur-sm px-2 py-1">
            {bullet.content}
          </span>
        </div>
      ))}
    </div>
  );
}
