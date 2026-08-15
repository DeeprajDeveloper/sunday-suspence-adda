const BENGALI = /[\u0980-\u09FF]/;

// Segments that are branding noise, not content
const BRAND = /^(sunday suspense(?: classics)?|mirchi bangla(?:\s+audio\s+story)?|audio story|bengali audio story)$/i;

// Single-word or short multi-word genre labels that appear before "Mirchi Bangla"
// but are NOT author names or story titles
const GENRE_TAG = /^(horror|thriller|psychological|supernatural|mystery|paranormal|drama|dark fantasy|sci-?fi|science fiction|psychological horror thriller)$/i;

function isBrand(s: string) { return BRAND.test(s); }
function isGenre(s: string) { return GENRE_TAG.test(s); }

export function parseStoryTitle(raw: string) {
  const parts = raw
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);

  // Is the opener "Sunday Suspense [Classics]"?
  const ssAtStart = /^sunday suspense/i.test(parts[0] ?? "");

  if (ssAtStart) {
    // ─── Modern format ────────────────────────────────────────────
    // Sunday Suspense | <Story> | [...] | <Author> | [genre tags] | Mirchi Bangla [Audio Story]
    //
    // Story  = parts[1]  (always the segment right after the opener)
    // Author = last segment before Mirchi Bangla, skipping trailing genre tags

    const displayTitle = parts[1] ?? raw;

    // Find Mirchi Bangla at the tail
    let tailIdx = parts.length - 1;
    while (tailIdx > 1 && isBrand(parts[tailIdx])) tailIdx--;

    // Skip any genre tags just before the brand tail
    while (tailIdx > 1 && isGenre(parts[tailIdx])) tailIdx--;

    // Whatever is at tailIdx is the author — unless it's the same slot as the story
    const author = tailIdx > 1 ? parts[tailIdx] : undefined;

    return { displayTitle, englishTitle: undefined, author };
  }

  // ─── Legacy format ──────────────────────────────────────────────
  // <Bengali Title> | <English Title> | <Author> | Sunday Suspense
  // OR
  // <Bengali Title> | <Author> | Sunday Suspense
  //
  // Strip all brand/genre noise first, then infer from what's left.

  const meaningful = parts.filter((p) => !isBrand(p) && !isGenre(p));
  const bengaliTitle = meaningful.find((p) => BENGALI.test(p));
  const englishParts = meaningful.filter((p) => !BENGALI.test(p));

  if (bengaliTitle) {
    // Two English segments → first is title translation, second is author
    // One English segment → it's the author (no English translation present)
    const englishTitle = englishParts.length >= 2 ? englishParts[0] : undefined;
    const author =
      englishParts.length >= 2
        ? englishParts[1]
        : englishParts[0];

    return { displayTitle: bengaliTitle, englishTitle, author };
  }

  // No Bengali title at all — first meaningful = title, last = author
  return {
    displayTitle: meaningful[0] ?? raw,
    englishTitle: undefined,
    author: meaningful.length >= 2 ? meaningful[meaningful.length - 1] : undefined,
  };
}
