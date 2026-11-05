// Any admin (super OR staff) — used for shared reads and staff-permitted writes
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// Super admin only. Anything whose adminRole is not explicitly 'staff' is treated
// as super, so legacy admin accounts (and the owner) never get locked out.
const superOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  if (req.user.adminRole === 'staff') {
    return res.status(403).json({ message: 'This action is restricted to the super admin. Raise a request instead.' })
  }
  next()
}

module.exports = { adminOnly, superOnly }
