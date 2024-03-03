import jwt from 'jsonwebtoken';
import { EXPIRES_IN, JWT_SECRET } from '../../../constants';

export function signJwt(payload: string | Buffer | object, expiresIn = EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
