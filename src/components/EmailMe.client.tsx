'use client'

const emailParts = {
  user: 'kellenbusby',
  domain: 'gmail',
  tld: 'com',
}
const constructEmail = () => {
  return `${emailParts.user}@${emailParts.domain}.${emailParts.tld}`
}

export default function EmailMe({ label }: { label?: string }) {
  const handleContactClick = () => {
    const email = constructEmail()
    window.open(`mailto:${email}`, '_blank')
  }

  return (
    <button
      className="group bg-black flex items-center gap-1.5 px-10 py-4 rounded-md text-lg hover:shadow-md hover:text-foreground cursor-pointer"
      onClick={handleContactClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5 group-hover:text-secondary"
      >
        <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z"></path>
      </svg>
      {label ?? 'Get in Touch'}
    </button>
  )
}
