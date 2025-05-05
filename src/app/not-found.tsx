import errorImage from '@/assets/images/404-error.png'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-dark-background text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <Image src={errorImage} alt="Error 404" className=" h-30 w-30 mt-4" />
      <p className="mt-4 text-4xl">Desculpe, não encontramos a página.</p>

      <Link href="/" className="mt-6 text-white hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  )
}
