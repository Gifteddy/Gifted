export function cdnImage(src: string, ops: string): string {
  return src.includes('/upload/') ? src.replace('/upload/', `/upload/${ops}/`) : src
}

export const CARD_IMG_OPS = 'f_auto,q_auto,w_800'
export const LIGHTBOX_IMG_OPS = 'f_auto,q_auto,w_1600,c_limit'
