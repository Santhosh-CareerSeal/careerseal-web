import { useState } from 'react'

// Password input with a show/hide eye toggle. Forwards all input props
// (value, onChange, placeholder, onKeyDown, etc.) and appends right padding
// so typed text never runs under the eye button.
function PasswordField({ className = '', eyeClassName = '', style, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative w-full">
      <input {...props} type={show ? 'text' : 'password'} className={`w-full ${className}`} style={{ ...style, paddingRight: 40 }} />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6b4edb] transition-colors ${eyeClassName}`}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default PasswordField
