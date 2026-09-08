import {NextResponse} from 'next/server';
import {prisma} from '../../../../lib/prisma';
import {getSession} from '../../../../lib/auth';

export async function GET(){
  const u=await getSession();
  if(!u||u.role==='DRIVER')return NextResponse.json({error:'Forbidden'},{status:403});
  const where:any=u.role==='ADMIN'?{hotelId:u.hotelId}:{};
  return NextResponse.json(await prisma.driver.findMany({where,include:{hotel:true,user:true},orderBy:{name:'asc'}}));
}

export async function POST(req:Request){
  const u=await getSession();
  if(!u||u.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403});
  try{
    const x=await req.json();
    if(!x.name?.trim()||!x.hotelId)throw new Error('Nama driver dan hotel wajib diisi');
    const d=await prisma.driver.create({data:{name:x.name.trim(),phone:x.phone?.trim()||null,hotelId:x.hotelId,active:x.active!==false}});
    await prisma.auditLog.create({data:{userId:u.id,action:'CREATE_DRIVER',newValue:JSON.stringify({id:d.id,name:d.name,hotelId:d.hotelId})}});
    return NextResponse.json(d);
  }catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
