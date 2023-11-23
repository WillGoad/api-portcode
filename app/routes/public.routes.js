const controller = require("../controllers/liveeditor.controller");

module.exports = function (app) {
    app.get(
        "/user/:username_in",
        controller.getUserInfo
    );
};
