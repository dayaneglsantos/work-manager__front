export default function Card({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`p-3 shadow-lg rounded-3xl bg-white dark:bg-[#181C14] w-fit ${className}`}
    >
      {children}
    </div>
  )
}
