// Where the GRID logo should take you: the signed-in user's own dashboard,
// or the public homepage when logged out.
export default function getHomeDest() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return '/'
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role === 'company') return '/company'
    if (user.role === 'college') return '/college-portal'
    if (user.role === 'admin') return '/admin'
    return '/dashboard'
  } catch (e) {
    return '/'
  }
}
