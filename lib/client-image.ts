/** Сжатие изображения в data URL для демо-хранилища (localStorage). */

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.readAsDataURL(file);
  });
}

export async function compressImageToDataUrl(file: File) {
  const dataUrl = await readFileAsDataUrl(file);
  const img = new window.Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Cannot load image"));
    img.src = dataUrl;
  });
  const maxSide = 1200;
  const ratio = Math.min(maxSide / img.width, maxSide / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

const RATIO_16_9 = 16 / 9;

/** Центральная обрезка под 16:9 и экспорт в JPEG (для карточек амбассадоров). */
export async function compressImageToDataUrl16x9(file: File, maxWidth = 1920, quality = 0.82) {
  const dataUrl = await readFileAsDataUrl(file);
  const img = new window.Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Cannot load image"));
    img.src = dataUrl;
  });
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return dataUrl;

  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;
  const ir = iw / ih;
  if (ir > RATIO_16_9) {
    sw = ih * RATIO_16_9;
    sx = (iw - sw) / 2;
  } else if (ir < RATIO_16_9) {
    sh = iw / RATIO_16_9;
    sy = (ih - sh) / 2;
  }

  const destW = Math.min(maxWidth, Math.round(sw));
  const destH = Math.round((destW * 9) / 16);
  const canvas = document.createElement("canvas");
  canvas.width = destW;
  canvas.height = destH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
  return canvas.toDataURL("image/jpeg", quality);
}
