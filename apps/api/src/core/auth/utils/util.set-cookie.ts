import { Response } from "express";

// set accessToken and refreshToken cookie to response
export function setTokensToCookie(res: Response, role: "user" | "app", accessToken: string) {
  if (res) {
    // set token to cookie
    res.cookie(`x-${role.toLocaleLowerCase()}-token`, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }
}
