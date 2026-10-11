type AvatarProps = {
  name?: string | null;
  image?: string | null;
  size?: number; // px
};

export default function Avatar({ name, image, size = 32 }: AvatarProps) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const style = { width: size, height: size, fontSize: size * 0.4 };

  return image ? (
    <img
      src={image}
      alt={name ?? "Profile"}
      referrerPolicy="no-referrer"
      style={style}
      className="rounded-full object-cover"
    />
  ) : (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-indigo-500 font-semibold text-white"
    >
      {initials}
    </div>
  );
}