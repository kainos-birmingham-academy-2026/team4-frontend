import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import { ChatProxyService } from "../services/chatProxyService";

export const createChatRouter = (
	chatProxyService?: ChatProxyService,
): Router => {
	const router = Router();
	const controller = new ChatController(
		chatProxyService ?? new ChatProxyService(),
	);

	router.post("/", (req, res) => controller.askChat(req, res));

	return router;
};

export default createChatRouter();
