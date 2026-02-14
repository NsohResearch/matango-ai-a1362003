
-- P0.3: Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('training-images', 'training-images', false);

-- Avatars: public read, user-scoped write
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Content: public read, user-scoped write
CREATE POLICY "Content is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'content');
CREATE POLICY "Users can upload content" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update content" ON storage.objects FOR UPDATE USING (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete content" ON storage.objects FOR DELETE USING (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Videos: public read, user-scoped write
CREATE POLICY "Videos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Users can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update videos" ON storage.objects FOR UPDATE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Training images: private, user-scoped
CREATE POLICY "Users can view own training images" ON storage.objects FOR SELECT USING (bucket_id = 'training-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload training images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'training-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update training images" ON storage.objects FOR UPDATE USING (bucket_id = 'training-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete training images" ON storage.objects FOR DELETE USING (bucket_id = 'training-images' AND auth.uid()::text = (storage.foldername(name))[1]);
