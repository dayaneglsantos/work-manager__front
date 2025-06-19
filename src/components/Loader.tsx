export default function Loader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <div className="relative w-[200] h-16 z-10">
        <span className="w-5 h-5 absolute rounded-full bg-primary left-[15%] origin-[50%] animate-loader-circle" />
        <span className="w-5 h-5 absolute rounded-full bg-primary left-[45%] origin-[50%] animate-loader-circle [animation-delay:0.2s]" />
        <span className="w-5 h-5 absolute rounded-full bg-primary left-auto right-[15%] origin-[50%] animate-loader-circle [animation-delay:0.3s]" />
        <span className="w-5 h-1 rounded-full bg-black/90 dark:bg-gray-400/90 absolute top-14 origin=[50%] z-[-1] left-[15%] blur-[1px] animate-loader-shadow" />
        <span className="w-5 h-1 rounded-full bg-black/90 dark:bg-gray-400/90 absolute top-14 origin=[50%] z-[-1] left-[45%] blur-[1px] animate-loader-shadow [animation-delay:0.2s]" />
        <span className="w-5 h-1 rounded-full bg-black/90 absolute dark:bg-gray-400/90 top-14 origin=[50%] z-[-1] left-auto right-[15%] blur-[1px] animate-loader-shadow [animation-delay:0.3s]" />
      </div>
      <span>{message}</span>
    </div>
  )
}
