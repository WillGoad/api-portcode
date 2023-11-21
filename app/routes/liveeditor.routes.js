const controller = require("../controllers/liveeditor.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/live-editor",
    [authJwt.verifyToken],
    controller.getUserInfo
  );

  app.put(
    "/api/live-editor",
    [authJwt.verifyToken],
    controller.updateUserInfo
  );

  app.get(
    "/api/qr-code",
    [authJwt.verifyToken],
    controller.getQRCode
  );
};
