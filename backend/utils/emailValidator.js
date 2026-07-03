const DISPOSABLE_DOMAINS = [
  'mailinator.com','tempmail.com','throwaway.email','guerrillamail.com',
  'yopmail.com','sharklasers.com','guerrillamailblock.com','grr.la',
  'guerrillamail.info','spam4.me','trashmail.com','trashmail.me',
  'trashmail.net','dispostable.com','maildrop.cc','getnada.com',
  'temp-mail.org','fakeinbox.com','mailnull.com','spamgourmet.com',
  'spamgourmet.net','spamgourmet.org','spamspot.com','spamthis.co.uk',
  'tempr.email','discard.email','spamoff.de','tempinbox.com',
  'mailtemp.net','tempmail.net','tempmail.org','throwam.com',
  'throwam.net','mytrashmail.com','mailnew.com','spamfree24.org',
  'tempemail.net','spamherelots.com','jetable.fr.nf','no-spam.ws',
  'getonemail.com','filzmail.com','spamfree.eu','trbvm.com',
  'binkmail.com','bobmail.info','dacoolest.com','junk1.tk',
  'super-auswahl.de','thankyou2010.com','thisisnotmyrealemail.com',
  'zoemail.org','eyepaste.com','tradermail.info','cameotv.com',
]

const VALID_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return { valid: false, message: 'Email is required' }
  const lower = email.toLowerCase().trim()
  if (!VALID_EMAIL_REGEX.test(lower)) return { valid: false, message: 'Please enter a valid email address' }
  const domain = lower.split('@')[1]
  if (DISPOSABLE_DOMAINS.includes(domain)) return { valid: false, message: 'Disposable email addresses are not allowed. Please use a real email.' }
  return { valid: true }
}

const validateIndianMobile = (mobile) => {
  if (!mobile) return { valid: true } // mobile is optional
  const cleaned = mobile.toString().replace(/\D/g, '')
  if (cleaned.length !== 10) return { valid: false, message: 'Mobile number must be exactly 10 digits' }
  if (!/^[6-9]/.test(cleaned)) return { valid: false, message: 'Mobile number must start with 6, 7, 8, or 9' }
  return { valid: true, cleaned }
}

module.exports = { validateEmail, validateIndianMobile }
