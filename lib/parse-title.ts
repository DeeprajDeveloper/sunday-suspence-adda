const BENGALI = /[\u0980-\u09FF]/;

const SKIP =
  /^(sunday suspense|mirchi bangla.*|audio story|bengali audio story)$/i;

export function parseStoryTitle(raw: string) {
  const parts = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  const meaningful = parts.filter((part) => !SKIP.test(part));
  const bengaliTitle = meaningful.find((part) => BENGALI.test(part));
  const englishTitle = meaningful.find(
    (part) => !BENGALI.test(part) && part.length < 48,
  );
  const author = meaningful.find(
    (part) => part !== bengaliTitle && part !== englishTitle && !BENGALI.test(part),
  );

  return {
    displayTitle: bengaliTitle || englishTitle || raw,
    englishTitle:
      englishTitle && englishTitle !== bengaliTitle ? englishTitle : undefined,
    author,
  };
}
