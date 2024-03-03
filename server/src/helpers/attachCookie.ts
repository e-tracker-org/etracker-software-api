import {Response} from "express";

export const attachCookie = (res: Response, jwt: string)  => {
    return res.cookie('accessToken', jwt, {
        maxAge: 3.154e10, // 1 year,
        httpOnly: true,
        domain: 'localhost',
        path: '/',
        sameSite: 'strict',
        secure: false,
    });
}

