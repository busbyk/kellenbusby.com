const emailParts = {
  user: 'kellenbusby',
  domain: 'gmail',
  tld: 'com',
}

const constructEmail = () => {
  return `${emailParts.user}@${emailParts.domain}.${emailParts.tld}`
}

export default function ContactButton({ size = 'default' }: { size?: 'default' | 'small' }) {
  const handleContactClick = () => {
    const email = constructEmail()
    window.open(`mailto:${email}`, '_blank')
  }

  return (
    <button
      className={`group bg-card-foreground text-card flex items-center gap-1.5 rounded-md hover:shadow-md ${size === 'small' ? 'px-5 py-2 text-sm' : 'px-10 py-4 text-lg'}`}
      onClick={handleContactClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`group-hover:text-accent ${size === 'small' ? 'h-4 w-4' : 'h-5 w-5'}`}
      >
        <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z"></path>
      </svg>
      Get in Touch
    </button>
  )
}
