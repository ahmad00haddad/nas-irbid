import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toArabicNumerals(num: number | string, padZero = true): string {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let str = num.toString();
  if (padZero && str.length === 1) str = "0" + str;
  return str.replace(/[0-9]/g, (w) => arabicNumbers[+w]);
}
