export interface TrustStat {
  value: string;
  caption: string;
  /** True when `value` is a placeholder awaiting a real figure from the client. */
  todo?: boolean;
}

export const trustStats: TrustStat[] = [
  { value: "5", caption: "лет на рынке" },
  // TODO: real in-stock count — ask client, don't guess (see chat history).
  { value: "TODO", caption: "позиций в наличии", todo: true },
  { value: "100%", caption: "прямые поставки от производителей" },
  { value: "⌀ × L", caption: "подбор по техническим параметрам" },
];
