export async function enhanceImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Orijinal resmi çiz
        ctx.drawImage(img, 0, 0);
        
        // Kontrast ve keskinlik artır
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Kontrast artırma (basit)
        const contrastFactor = 1.3;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = ((data[i] - 128) * contrastFactor) + 128;     // R
          data[i+1] = ((data[i+1] - 128) * contrastFactor) + 128; // G
          data[i+2] = ((data[i+2] - 128) * contrastFactor) + 128; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Canvas'ı Blob'a çevir
        canvas.toBlob((blob) => {
          const enhancedFile = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(enhancedFile);
        }, 'image/jpeg', 0.95);
      };
    };
    
    reader.readAsDataURL(file);
  });
}