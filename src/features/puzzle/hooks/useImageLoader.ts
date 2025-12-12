import { useState, useCallback } from 'react';

export function useImageLoader() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const loadFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageUrl(img.src);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const loadFromUrl = useCallback((url: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setImage(img);
      setImageUrl(url);
    };
    img.src = url;
  }, []);

  const resetImage = useCallback(() => {
    setImage(null);
    setImageUrl(null);
  }, []);

  return {
    image,
    imageUrl,
    loadFromFile,
    loadFromUrl,
    resetImage
  };
}
