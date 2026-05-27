/**
 * Central support / WhatsApp configuration (digits only, country code without +).
 * Update for production.
 */
export const SITE_WHATSAPP_E164 = "77001234567";

/** Optional prefilled question (URL-encoded by consumers). */
export const SITE_WHATSAPP_PREFILL =
  "Здравствуйте! У меня вопрос по заказу Jarqyn.";

export function buildWhatsAppHref(): string {
  const text = encodeURIComponent(SITE_WHATSAPP_PREFILL);
  return `https://wa.me/${SITE_WHATSAPP_E164}?text=${text}`;
}
