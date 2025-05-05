'use client'

interface ButtonProps {
  title: string
  onClick?: () => void
}

const Button = ({ title, onClick }: ButtonProps) => {
  return (
    <button
      className="bg-primary-dark cursor-pointer font-bold rounded-2xl p-2 hover:bg-primary transition ease-in-out duration-300 text-white mt-3 "
      onClick={onClick}
    >
      {title}
    </button>
  )
}

export default Button
