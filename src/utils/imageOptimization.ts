
/**
 * Service d'optimisation et de compression d'images
 * Pour une implémentation réelle, vous pourriez utiliser 
 * une bibliothèque comme compressorjs
 */

export interface ImageOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageOptimizer {
  /**
   * Compresse une image à partir d'un File ou Blob
   */
  static async compressImage(
    file: File | Blob,
    options: ImageOptions = {}
  ): Promise<Blob> {
    const { 
      quality = 0.7, 
      maxWidth = 1200, 
      maxHeight = 1200,
      format = 'jpeg' 
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Calculer les dimensions
        let width = img.width;
        let height = img.height;
        
        // Redimensionner si nécessaire
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Créer un canvas pour la compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Impossible de créer le contexte du canvas"));
          return;
        }
        
        // Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob avec compression
        let mimeType = 'image/jpeg';
        if (format === 'png') mimeType = 'image/png';
        if (format === 'webp') mimeType = 'image/webp';
        
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Échec de la compression d'image"));
            }
          },
          mimeType,
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Échec du chargement de l'image"));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convertir une image en Base64
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Précharge une image pour améliorer l'affichage
   */
  static preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}
