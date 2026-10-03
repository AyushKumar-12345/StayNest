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

module.exports.toggleFavorite = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Please log in first" });
        }

        const { id } = req.params;
        const user = await User.findById(req.user._id);

        const index = user.favorites.indexOf(id);
        let isFavorite = false;

        if (index === -1) {
            user.favorites.push(id);
            isFavorite = true;
        } else {
            user.favorites.splice(index, 1);
            isFavorite = false;
        }

        await user.save();
        res.json({ success: true, isFavorite });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.renderWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate("favorites");
        const allListings = user.favorites || [];
        res.render("users/wishlist.ejs", { allListings });
    } catch (err) {
        next(err);
    }
};