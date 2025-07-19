export default function Logo() {
  return (
    <div className="text-center relative py-6">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold)] opacity-15 blur-2xl rounded-full"></div>
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-64 h-64 border border-[var(--color-m1-gold)]/20 rounded-full"></div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-48 h-48 border border-[var(--color-m1-crimson)]/10 rounded-full"></div>

      {/* メインタイトル */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold-light)] opacity-30 blur-xl transform scale-110"></div>
        <h1 className="relative pb-2 text-5xl font-black bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold-light)] bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
          G-1
        </h1>
        <div className="relative -mt-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold-light)] bg-clip-text text-transparent tracking-wide">
            グランプリ
          </h1>
        </div>
      </div>

      {/* サブタイトル */}
      <div className="relative mb-4">
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-[var(--color-m1-midnight)]/80 to-[var(--color-m1-charcoal)]/80 rounded-full border border-[var(--color-m1-gold)]/30 backdrop-blur-sm">
          <h2 className=" font-semibold bg-gradient-to-r from-[var(--color-m1-silver)] to-[var(--color-m1-gold-light)] bg-clip-text text-transparent tracking-widest">
            GESTURE-1 GRAND PRIX
          </h2>
        </div>
      </div>

      {/* 装飾ライン */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[var(--color-m1-gold)]"></div>
        <div className="w-3 h-3 bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-champagne)] rounded-full shadow-lg shadow-[var(--color-m1-gold)]/50"></div>
        <div className="w-24 h-0.5 bg-gradient-to-r from-[var(--color-m1-gold)] via-[var(--color-m1-champagne)] to-[var(--color-m1-gold)] rounded-full shadow-lg shadow-[var(--color-m1-gold)]/50"></div>
        <div className="w-3 h-3 bg-gradient-to-r from-[var(--color-m1-champagne)] to-[var(--color-m1-gold)] rounded-full shadow-lg shadow-[var(--color-m1-gold)]/50"></div>
        <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[var(--color-m1-gold)]"></div>
      </div>

      {/* キャッチフレーズ */}
      <div className="relative">
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-[var(--color-m1-gold)] rounded-full animate-pulse"></div>
          <p className="text-[var(--color-m1-silver-dark)] text-xs tracking-wider font-medium">
            ジェスチャーの頂点を決める戦い
          </p>
          <div className="w-1.5 h-1.5 bg-[var(--color-m1-crimson)] rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
