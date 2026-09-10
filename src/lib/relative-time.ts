// Arabic relative time formatting for admin activity lists.
export function relativeTimeAr(input: string | number | Date): string {
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const min = Math.round(diffMs / 60000);

  if (min < 1) return "الآن";
  const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });
  if (min < 60) return rtf.format(-min, "minute");
  const hours = Math.round(min / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(months / 12), "year");
}

export function fullDateAr(input: string | number | Date): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-JO", { dateStyle: "long", timeStyle: "short" });
}
