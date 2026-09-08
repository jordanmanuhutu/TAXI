import { cookies } from 'next/headers';
import crypto from 'crypto';
import { Role } from '@prisma/client';

export type SessionUser = { id:string; username:string; name:string; role:Role; hotelId?:string|null; driverId?:string|null };
const SECRET = process.env.SESSION_SECRET || 'change-this-in-production';
const COOKIE='taxi_session';
function sign(payload:string){return crypto.createHmac('sha256',SECRET).update(payload).digest('hex')}
export function encodeSession(user:SessionUser){const payload=Buffer.from(JSON.stringify(user)).toString('base64url'); return `${payload}.${sign(payload)}`}
export function decodeSession(value:string|undefined):SessionUser|null{try{if(!value)return null;const [payload,sig]=value.split('.');if(!payload||!sig||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(sign(payload))))return null;return JSON.parse(Buffer.from(payload,'base64url').toString())}catch{return null}}
export async function getSession(){const c=await cookies();return decodeSession(c.get(COOKIE)?.value)}
export const sessionCookieName=COOKIE;
export function requireRole(user:SessionUser|null, roles:Role[]){if(!user)throw new Error('UNAUTHORIZED');if(!roles.includes(user.role))throw new Error('FORBIDDEN');return user}
