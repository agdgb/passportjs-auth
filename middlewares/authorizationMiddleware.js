const Authorize = (allowedRoles) =>
{
  return (req, res, next) =>
  {
    const userHasRole = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!userHasRole)
    {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

module.exports = Authorize;
