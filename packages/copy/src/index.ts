// Typed copy library. All user-facing strings live here.
// Translations live in src/<locale>.ts. The default locale is en.
// See docs/04_VOICE_AND_TONE.md for principles.

import { en } from "./en";

export type Locale = "en";
export type CopyKey = keyof typeof en;
export type CopyDict = typeof en;

const DICTIONARIES: Record<Locale, CopyDict> = { en };

export function getCopy(locale: Locale = "en"): CopyDict {
  return DICTIONARIES[locale];
}

export function t(
  locale: Locale,
  key: CopyKey,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTIONARIES[locale];
  const tmpl: string = dict[key];
  if (!vars) return tmpl;
  return Object.entries(vars).reduce<string>(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    tmpl,
  );
}

export { en };
