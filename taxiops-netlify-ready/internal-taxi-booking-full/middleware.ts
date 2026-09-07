import {NextRequest,NextResponse} from 'next/server';
import {decodeSession,sessionCookieName} from './lib/auth';
export function middleware(req:NextRequest){
 const p=req.nextUrl.pathname;
 if(p.startsWith('/_next')||p.startsWith('/api/auth')||p==='/login'||p==='/favicon.ico')return NextResponse.next();
 const u=decodeSession(req.cookies.get(sessionCookieName)?.value);
 if(!u){if(p.startsWith('/api/'))return NextResponse.json({error:'Unauthorized'}, {status:401}); return NextResponse.redirect(new URL('/login',req.url));}
 if(p.startsWith('/admin') && u.role==='DRIVER') return NextResponse.redirect(new URL('/driver',req.url));
 if(p.startsWith('/driver') && u.role!=='DRIVER') return NextResponse.redirect(new URL('/dashboard',req.url));
 return NextResponse.next();
}
export const config={matcher:['/((?!.*\\..*).*)']};
