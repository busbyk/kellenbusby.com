export function ProfileContainer({
  href,
  children,
  tooltip,
}: {
  href: string;
  children: React.ReactNode;
  tooltip: string;
}) {
  return (
    <a
      href={href}
      className="relative rounded-full h-10 w-10 md:h-12 md:w-12 flex justify-center items-center"
    >
      <div className="peer">{children}</div>
      <div className="hidden md:block absolute bottom-0 peer-hover:translate-y-[115%] opacity-0 peer-hover:opacity-100 transition-all duration-200 pointer-events-none">
        <span className="whitespace-nowrap text-xs">{tooltip}</span>
      </div>
    </a>
  );
}
