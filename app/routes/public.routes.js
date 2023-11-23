const controller = require("../controllers/public.controller");

module.exports = function (app) {
    app.get(
        "/user/:username_in",
        controller.getUserInfo
    );
};
