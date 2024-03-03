import { Response } from "express";

export function apiResponse(res: Response, message: string, data: Object | string | null = null, statusCode: number | null = null) {
  const body = {
    success: true,
    message, data
  };
  return res.status(statusCode || 200).json(body);
}

export function apiError(res: Response, message: string, statusCode: number | null = null, data: Object | string | null = null) {
  const body = {
    success: false,
    message, data
  };
  return res.status(statusCode || 400).json(body);
}
