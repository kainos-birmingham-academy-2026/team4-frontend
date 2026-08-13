import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requireAuth } from "../../src/middlewares/authMiddleware";

describe("requireAuth", () => {
	it("redirects to login when there is no jwt token", () => {
		const req = {
			session: {},
		} as Request;
		const res = {
			redirect: vi.fn(),
		} as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		requireAuth(req, res, next);

		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("calls next when jwt token exists", () => {
		const req = {
			session: { jwtToken: "token" },
		} as Request;
		const res = {
			redirect: vi.fn(),
		} as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		requireAuth(req, res, next);

		expect(res.redirect).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledOnce();
	});
});
