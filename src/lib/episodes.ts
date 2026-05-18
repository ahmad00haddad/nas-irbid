import oldCity from "@/assets/old-city.jpg";
import craftsman from "@/assets/craftsman.jpg";
import hero from "@/assets/hero.jpg";

export type Episode = {
  id: string;
  number: number;
  title: string;
  character: string;
  neighborhood: string;
  duration: string;
  date: string;
  excerpt: string;
  image: string;
  tags: string[];
};

export const episodes: Episode[] = [
  {
    id: "darkal",
    number: 1,
    title: "بيت الدركل · ذاكرة حارة البارحة",
    character: "عائلة الدركل",
    neighborhood: "حارة البارحة",
    duration: "٢٢ دقيقة",
    date: "٢٠٢٥",
    excerpt:
      "بين جدران بيت قديم، تروي عائلة الدركل قصة جيلٍ شكّل ملامح إربد بأياديهم وذكرياتهم.",
    image: oldCity,
    tags: ["عائلات", "حارة البارحة", "ذاكرة"],
  },
  {
    id: "saroukis",
    number: 2,
    title: "مخبز ساركيس · رائحة الطفولة",
    character: "ساركيس",
    neighborhood: "وسط البلد",
    duration: "١٨ دقيقة",
    date: "٢٠٢٥",
    excerpt:
      "مخبز عمره أكثر من نصف قرن، لا تزال رائحته تستحضر أيام المدرسة وأكياس الورق البنية.",
    image: craftsman,
    tags: ["مهن", "وسط البلد", "أرمن"],
  },
  {
    id: "zaraini",
    number: 3,
    title: "كشك الزرعيني · أول كتاب اشتريته",
    character: "أبو محمد الزرعيني",
    neighborhood: "شارع الجامعة",
    duration: "٢٥ دقيقة",
    date: "٢٠٢٥",
    excerpt:
      "كشك صغير صنع أجيالاً من القرّاء. هنا يبدأ كثيرون رحلتهم مع أول رواية أو ديوان شعر.",
    image: hero,
    tags: ["ثقافة", "شارع الجامعة", "كتب"],
  },
];
