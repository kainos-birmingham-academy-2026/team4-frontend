import "express-session";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
	}
}

declare global {
	namespace Express {
		interface Request {
			session: Record<string, any> & { jwtToken?: string };
		}
	}
}
