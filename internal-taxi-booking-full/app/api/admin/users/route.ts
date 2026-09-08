import {NextResponse} from 'next/server';
import {prisma} from '../../../../lib/prisma';
import {getSession} from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(){
  const u=await getSession();
  if(!u||u.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403});
  return NextResponse.json(await prisma.user.findMany({include:{hotel:true,driver:true},orderBy:{username:'asc'}}));
}

export async function POST(req:Request){
  const u=await getSession();
  if(!u||u.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403});
  try{
    const x=await req.json();
    if(!x.username?.trim()||!x.name?.trim()||!x.password?.trim())throw new Error('Username, nama, dan password wajib diisi');
    if(!['SUPER_ADMIN','ADMIN','DRIVER'].includes(x.role))throw new Error('Role tidak valid');
    if(x.role==='DRIVER'&&!x.driverId)throw new Error('Driver wajib dipilih untuk user DRIVER');
    const user=await prisma.user.create({data:{username:x.username.trim(),name:x.name.trim(),passwordHash:await bcrypt.hash(x.password.trim(),12),role:x.role,hotelId:x.hotelId||null,active:x.active!==false,driver:x.role==='DRIVER'?{connect:{id:x.driverId}}:undefined}});
    await prisma.auditLog.create({data:{userId:u.id,action:'CREATE_USER',newValue:JSON.stringify({id:user.id,username:user.username,name:user.name,role:user.role,hotelId:user.hotelId})}});
    return NextResponse.json({id:user.id,username:user.username,name:user.name,role:user.role,hotelId:user.hotelId,active:user.active});
  }catch(e:any){return NextResponse.json({error:e?.code==='P2002'?'Username atau driver sudah digunakan.':e.message},{status:400});}
}
