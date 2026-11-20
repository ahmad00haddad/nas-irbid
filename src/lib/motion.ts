import type { Transition } from "framer-motion";

/**
 * Elastic motion presets — نابض مرن موحّد لكل الموقع.
 * elastic: ارتداد واضح للعناصر التفاعلية (أزرار، بطاقات، رقاقات)
 * elasticSoft: ارتداد خفيف لدخول العناصر إلى الشاشة
 * elasticSnappy: ارتداد سريع للضغط والتحويم
 */
export const elastic: Transition = { type: "spring", stiffness: 260, damping: 14, mass: 0.9 };
export const elasticSoft: Transition = { type: "spring", stiffness: 160, damping: 16, mass: 1 };
export const elasticSnappy: Transition = { type: "spring", stiffness: 520, damping: 20 };
export const elasticBouncy: Transition = { type: "spring", stiffness: 420, damping: 10 };

/** دخول مرن: انزلاق + تكبير خفيف مع ارتداد */
export const elasticEnter = {
  initial: { opacity: 0, y: 28, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: elasticSoft,
};

/** ضغط مرن للأزرار */
export const elasticTap = { scale: 0.92 };
export const elasticHover = { scale: 1.04 };
