import { Router } from "express";
import testEmailSender from "../controller/testEmail.controller.js";

const router = Router();

router.route("/").get(testEmailSender);

export default router;
