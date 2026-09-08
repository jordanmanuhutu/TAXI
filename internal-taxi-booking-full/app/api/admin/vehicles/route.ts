import {NextResponse} from 'next/server';
import {prisma} from '../../../../lib/prisma';
import {getSession} from '../../../../lib/auth';

export async function GET(){
  const u=await getSession();
  if(!u||u.role==='DRIVER')return NextResponse.json({error:'Forbidden'},{status:403});
  const where:any=u.role==='ADMIN'?{hotelId:u.hotelId}:{};
  return NextResponse.json(await prisma.vehicle.findMany({where,include:{hotel:true},orderBy:{plateNumber:'asc'}}));
}

export async function POST(req:Request){
  const u=await getSession();
  if(!u||u.role!=='SUPER_ADMIN')return NextResponse.json({error:'Forbidden'},{status:403});
  try{
    const x=await req.json();
    if(!x.plateNumber?.trim()||!x.vehicleType?.trim()||!x.hotelId)throw new Error('Tipe kendaraan, nomor polisi, dan hotel wajib diisi');
    const v=await prisma.vehicle.create({data:{vehicleName:x.vehicleName?.trim()||null,vehicleType:x.vehicleType.trim(),plateNumber:x.plateNumber.trim().toUpperCase(),hotelId:x.hotelId,active:x.active!==false}});
    await prisma.auditLog.create({data:{userId:u.id,action:'CREATE_VEHICLE',newValue:JSON.stringify({id:v.id,vehicleName:v.vehicleName,plateNumber:v.plateNumber,hotelId:v.hotelId})}});
    return NextResponse.json(v);
  }catch(e:any){return NextResponse.json({error:e?.code==='P2002'?'Nomor polisi sudah digunakan.':e.message},{status:400});}
}
