const { Router } = require("express");

const SessionsController = require("../controllers/SessionsController");
const sessionscontroller = new SessionsController();

const sessionsRoutes = Router();
sessionsRoutes.post("/", sessionscontroller.create)

module.exports = sessionsRoutes