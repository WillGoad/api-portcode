const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    controller.signup
  );

  app.post(
    "/api/auth/signup-verify",
    controller.verifysignup
  );

  app.post(
    "/api/auth/signin-verify",
    controller.verifysignin
  );

  app.post("/api/auth/signin", controller.signin);
};
