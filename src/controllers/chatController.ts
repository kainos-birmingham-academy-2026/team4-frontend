import type { Request, Response } from "express";
import {
	ChatProxyService,
	ChatProxyServiceError,
} from "../services/chatProxyService";

export class ChatController {
	constructor(
		private readonly chatProxyService: ChatProxyService = new ChatProxyService(),
	) {}

	async askChat(req: Request, res: Response): Promise<void> {
		const message = String(
			(req.body as { message?: unknown })?.message ?? "",
		).trim();
		if (!message) {
			res
				.status(400)
				.json([{ field: "message", message: "Message is required" }]);
			return;
		}

		try {
			const response = await this.chatProxyService.ask(message);
			res.status(200).json(response);
		} catch (error) {
			if (error instanceof ChatProxyServiceError) {
				res.status(error.statusCode).json({ error: error.message });
				return;
			}
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
