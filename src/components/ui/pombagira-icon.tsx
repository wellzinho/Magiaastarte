export type IconName =
  | "rose"
  | "moon"
  | "candle"
  | "trident"
  | "heart"
  | "star"
  | "bowl"
  | "smoke"
  | "bookmark"
  | "search"
  | "spark"
  | "path"
  | "ask"
  | "glass";

const paths: Record<IconName, string> = {
  rose: "M12 20s-6-3.6-6-8.2C6 8.6 8.2 7 10.2 7c1.2 0 2.1.5 1.8 1.8C12.4 7.4 13.4 6 15 6c2.2 0 3.8 2 3.8 4.6C18.8 15.6 12 20 12 20Z M12 10.5c.4-1.8 1.7-3.2 3.2-3.6",
  moon: "M15.2 4.4A7.8 7.8 0 1 0 19 16.4 6.4 6.4 0 0 1 15.2 4.4Z",
  candle: "M12 3.5s1.6 1.6 1.6 3.1S12.7 8.4 12 8.4 10.4 7.1 10.4 6.6 12 3.5 12 3.5ZM9.4 9.2h5.2v8.4c0 1.2-1.2 2.1-2.6 2.1h0c-1.4 0-2.6-.9-2.6-2.1V9.2Z",
  trident:
    "M12 21V9 M12 9 6.5 3.8 M12 9 17.5 3.8 M12 9 12 3.2 M7.5 11.2h9",
  heart:
    "M12 19s-7-4.2-7-9.1C5 7.3 6.8 5.8 9 5.8c1.4 0 2.4.7 3 1.7.6-1 1.6-1.7 3-1.7 2.2 0 4 1.5 4 4.1C19 14.8 12 19 12 19Z",
  star: "M12 3.5 13.8 9H19l-4.2 3.2L16.6 18 12 14.8 7.4 18l1.8-5.8L5 9h5.2L12 3.5Z",
  bowl: "M5 11c.6 4.2 3.4 7 7 7s6.4-2.8 7-7H5Z M4.5 11h15 M9 6.5h6",
  smoke: "M10 19c-1.4-2.2.4-3.4 1.2-4.8.8-1.4-.4-2.4-1.2-3.7C8.8 8.6 10.4 6.8 12 5 M14 19c-1.2-2 .8-3.2 1.4-4.6.7-1.5-.2-2.5-1-3.8",
  bookmark: "M7.5 4.5h9v15L12 16.2 7.5 19.5v-15Z",
  search:
    "M11 16.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11ZM15.2 15.2 19 19",
  spark:
    "M12 4v3.5M12 16.5V20M4 12h3.5M16.5 12H20M7.2 7.2l2.2 2.2M14.6 14.6l2.2 2.2M16.8 7.2l-2.2 2.2M9.4 14.6l-2.2 2.2",
  path: "M7 17.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM12 13.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM17 8.9a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z",
  ask: "M9.4 9a2.6 2.6 0 1 1 4.4 1.9c-.8.6-1.8 1.2-1.8 2.4 M12 16.6h.01 M12 20.2a8.2 8.2 0 1 1 0-16.4 8.2 8.2 0 0 1 0 16.4Z",
  glass:
    "M8 4.5h8l-1.4 6.4c-.4 1.8-2 3-3.6 3h0c-1.6 0-3.2-1.2-3.6-3L8 4.5ZM12 14v5.5M9.2 19.5h5.6",
};

export function PombagiraIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
