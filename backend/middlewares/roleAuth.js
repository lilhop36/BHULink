const checkRole = (roles) => {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ 
				message: "Access denied: You do not have the required permissions." 
			});
		}
		next();
	};
};

module.exports = { checkRole };