const permit = (...allowed) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No auth' });

    const roleName = req.user.idRolName;
    const roleId = req.user.idRol;

    const allowedNames = allowed.filter(a => typeof a === 'string');
    const allowedIds = allowed.filter(a => typeof a === 'number');

    if (allowedNames.includes(roleName) || allowedIds.includes(roleId)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  };
};

module.exports = permit;
