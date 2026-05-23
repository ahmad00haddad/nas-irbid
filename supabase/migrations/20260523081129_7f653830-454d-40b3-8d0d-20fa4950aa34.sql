
INSERT INTO public.episodes (slug, title, character_name, neighborhood, youtube_id, episode_number, season, short_description, published, published_at)
VALUES
  ('saroukis-baker', 'سركيس الخباز', 'سركيس', 'وسط البلد', 'jBTSEPj5GyI', 1, 1, 'مخبز عمره أكثر من نصف قرن في قلب إربد، ورائحة طفولة لا تُنسى.', true, now()),
  ('om-mohammad-masreyya', 'أم محمد المصرية', 'أم محمد', 'إربد', 'zgpJlRXTZ4o', 2, 1, 'حكاية امرأة جاءت من مصر وصارت جزءاً من نسيج إربد.', true, now()),
  ('qadri', 'قدري', 'قدري', 'إربد', 'rmWhFLqr6t8', 3, 1, 'شخصية إربدية لها بصمة في الذاكرة المحلية.', true, now()),
  ('dalqamouni', 'الدلقموني', 'الدلقموني', 'إربد', 'm9JwqHfYGmw', 4, 1, 'قصة شخصية حملت اسم عائلتها وحوّلته إلى علامة.', true, now()),
  ('darkal', 'دركل', 'عائلة الدركل', 'حارة البارحة', 'KYhOjJrzCkI', 5, 1, 'بين جدران بيت قديم، عائلة شكّلت ملامح إربد بأياديها.', true, now()),
  ('cinema-street-hawazen', 'شارع السينما — هوازن الصليبي', 'هوازن الصليبي', 'شارع السينما', 'z9fOcExmjl4', 6, 1, 'حكاية شارع كان قلب الفن في إربد، يرويها أحد أبنائه.', true, now()),
  ('zaraini-kiosk', 'كشك الزرعيني', 'أبو محمد الزرعيني', 'شارع الجامعة', 'DoFWU_wXoQs', 7, 1, 'كشك صغير صنع أجيالاً من القرّاء.', true, now()),
  ('shabbar', 'الشبار', 'الشبار', 'إربد', '4yKOrO7fLJs', 8, 1, 'حكاية من حكايات إربد التي لا تُنسى.', true, now())
ON CONFLICT (slug) DO UPDATE SET
  youtube_id = EXCLUDED.youtube_id,
  title = EXCLUDED.title,
  character_name = EXCLUDED.character_name,
  neighborhood = EXCLUDED.neighborhood,
  episode_number = EXCLUDED.episode_number,
  short_description = EXCLUDED.short_description,
  published = true,
  published_at = COALESCE(public.episodes.published_at, now());
