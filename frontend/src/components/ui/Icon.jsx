import React from 'react'

const Icon = ({ name, size = 22 }) => {
  const paths = {
    phone: (
      <path d="M21 16.4v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6 19.7 19.7 0 0 1-3.1-8.7A2 2 0 0 1 3.1 1.5h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7 9.4a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z" />
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l-1 13H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    chevron: (
      <>
        <path d="m8 10 4 4 4-4" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z" />
        <path d="M4 21c2-5 6-9 12-12" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
    heart: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z" />
        <path d="m19 15 .6 2.1L22 18l-2.4.9L19 21l-.6-2.1L16 18l2.4-.9L19 15Z" />
      </>
    ),
    drop: (
      <>
        <path d="M12 3s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12Z" />
      </>
    ),
    hoof: (
      <>
        <path d="M8 5c-2 2-3 5-3 8 0 5 3 8 7 8s7-3 7-8c0-3-1-6-3-8" />
        <path d="M8 5c1 3 2 4 4 4s3-1 4-4M9 14h.01M15 14h.01M12 17h.01" />
      </>
    ),
    spray: (
      <>
        <path d="M9 7h8v3h-3v2M10 12h5v9H7v-6c0-2 1-3 3-3Z" />
        <path d="M11 7V4h5M18 6h3M18 3l2-1M18 9l2 1" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    telegram: (
      <>
        <path d="m21 3-4 18-6-5-4 3 1-6L3 10 21 3Z" />
        <path d="m8 13 9-6-6 9" />
      </>
    ),
    bale: (
      <>
        <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3Z" />
        <path d="m7 11 3 3 7-7" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export default Icon
