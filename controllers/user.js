const User = require("../models/user");

module.exports.renderSignupform = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!email || !password) {
            req.flash("error", "Email and password are required.");
            return res.redirect("/signup");
        }

        const newUser = new User({
            username: username || email.split("@")[0],
            email,
            profileImage: {
                url: "https://placehold.co/150x150?text=User",
                filename: "default-profile"
            }
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to StayNest!");
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginform = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to StayNest!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have been logged out successfully.");
        res.redirect("/listings");
    });
};