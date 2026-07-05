import { supabase } from '../supabase/supabaseClient';

export const imageService = {
    /**
     * Uploads an image from a local URI to Supabase Storage and returns the public URL.
     * Works perfectly in React Native / Expo.
     */
    async uploadImage(localUri: string, bucket: 'room-images' | 'profiles' = 'room-images'): Promise<string> {
        try {
            // Get file name and extension
            const fileExt = localUri.split('.').pop() || 'jpg';
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Fetch local URI and convert to Blob
            const response = await fetch(localUri);
            const blob = await response.blob();

            const { error } = await supabase.storage
                .from(bucket)
                .upload(filePath, blob, {
                    contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
                    upsert: true,
                });

            if (error) {
                console.error('[ImageService] Upload error details:', error);
                throw error;
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error('Failed to generate public URL');
            }

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('[ImageService] uploadImage failed:', error);
            throw error;
        }
    }
};
