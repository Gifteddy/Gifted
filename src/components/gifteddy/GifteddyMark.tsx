const CLOUDINARY_ICON = 'https://res.cloudinary.com/dr4fjf3a1/image/upload/v1781893262/ted_w9afow.png'

export function GifteddyMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <img
      src={CLOUDINARY_ICON}
      alt="Gifteddy"
      className={`${className} rounded-full object-cover`}
    />
  )
}


