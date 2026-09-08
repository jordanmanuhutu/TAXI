import {NextResponse} from 'next/server';
import {prisma} from '../../../../lib/prisma';
import {getSession} from '../../../../lib/auth';

export async function GET(){
  const u=await getSession();
  if(!u||u.role==='DRIVER')return NextResponse.json({error:'Forbidden'},{status:403});
  return NextResponse.json(await prisma.hotel.findMany({orderBy:{name:'asc'}}));
}

export async function POST(req:Request){
  const u=await getSession();
  if(!u||u.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403});
  try{
    const x=await req.json();
    if(!x.name?.trim())throw new Error('Nama hotel wajib diisi');
    const h=await prisma.hotel.create({data:{name:x.name.trim(),address:x.address?.trim()||null,active:x.active!==false}});
    await prisma.auditLog.create({data:{userId:u.id,action:'CREATE_HOTEL',newValue:JSON.stringify({id:h.id,name:h.name,address:h.address})}});
    return NextResponse.json(h);
  }catch(e:any){return NextResponse.json({error:e?.code==='P2002'?'Nama hotel sudah digunakan.':e.message},{status:400});}
}
