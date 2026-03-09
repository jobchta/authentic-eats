INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read dish images" ON storage.objects FOR SELECT USING (bucket_id = 'dish-images');

CREATE POLICY "Service role insert dish images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dish-images');