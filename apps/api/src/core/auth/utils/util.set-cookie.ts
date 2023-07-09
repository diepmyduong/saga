import { Response } from "express";

// set accessToken and refreshToken cookie to response
export function setTokensToCookie(res: Response, accessToken: string, refreshToken: string) {
  if (res) {
    // set token to cookie
    res.cookie("x-token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    // set refresh token to cookie
    res.cookie("x-refresh-token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }
}
