import {NextResponse} from 'next/server';
import {prisma} from '../../../../../lib/prisma';
import {getSession} from '../../../../../lib/auth';
import bcrypt from 'bcryptjs';

const allowed = new Set(['hotels', 'vehicles', 'drivers', 'users']);

export async function PUT(req: Request, context: {params: Promise<{resource: string; id: string}>}) {
  const u = await getSession();
  if (!u || u.role !== 'SUPER_ADMIN') return NextResponse.json({error:'Forbidden'}, {status:403});

  const {resource, id} = await context.params;
  if (!allowed.has(resource)) return NextResponse.json({error:'Resource tidak valid'}, {status:404});

  try {
    const x = await req.json();

    if (resource === 'hotels') {
      const old = await prisma.hotel.findUnique({where:{id}});
      if (!old) throw new Error('Hotel tidak ditemukan');
      if (!x.name?.trim()) throw new Error('Nama hotel wajib diisi');
      const updated = await prisma.hotel.update({where:{id}, data:{name:x.name.trim(), address:x.address?.trim() || null, active:Boolean(x.active)}});
      await prisma.auditLog.create({data:{userId:u.id, action:'EDIT_HOTEL', oldValue:JSON.stringify({name:old.name,address:old.address,active:old.active}), newValue:JSON.stringify({name:updated.name,address:updated.address,active:updated.active}), notes:`Hotel ${old.name} diubah menjadi ${updated.name}`}});
      return NextResponse.json(updated);
    }

    if (resource === 'vehicles') {
      const old = await prisma.vehicle.findUnique({where:{id}});
      if (!old) throw new Error('Kendaraan tidak ditemukan');
      if (!x.plateNumber?.trim()) throw new Error('Nomor polisi wajib diisi');
      if (!x.vehicleType?.trim()) throw new Error('Tipe kendaraan wajib diisi');
      if (!x.hotelId) throw new Error('Hotel wajib dipilih');
      const updated = await prisma.vehicle.update({where:{id}, data:{vehicleName:x.vehicleName?.trim() || null, vehicleType:x.vehicleType.trim(), plateNumber:x.plateNumber.trim().toUpperCase(), hotelId:x.hotelId, active:Boolean(x.active)}});
      await prisma.auditLog.create({data:{userId:u.id, action:'EDIT_VEHICLE', oldValue:JSON.stringify({vehicleName:old.vehicleName,vehicleType:old.vehicleType,plateNumber:old.plateNumber,hotelId:old.hotelId,active:old.active}), newValue:JSON.stringify({vehicleName:updated.vehicleName,vehicleType:updated.vehicleType,plateNumber:updated.plateNumber,hotelId:updated.hotelId,active:updated.active})}});
      return NextResponse.json(updated);
    }

    if (resource === 'drivers') {
      const old = await prisma.driver.findUnique({where:{id}});
      if (!old) throw new Error('Driver tidak ditemukan');
      if (!x.name?.trim()) throw new Error('Nama driver wajib diisi');
      if (!x.hotelId) throw new Error('Hotel wajib dipilih');
      const updated = await prisma.driver.update({where:{id}, data:{name:x.name.trim(), phone:x.phone?.trim() || null, hotelId:x.hotelId, active:Boolean(x.active)}});
      await prisma.auditLog.create({data:{userId:u.id, action:'EDIT_DRIVER', oldValue:JSON.stringify({name:old.name,phone:old.phone,hotelId:old.hotelId,active:old.active}), newValue:JSON.stringify({name:updated.name,phone:updated.phone,hotelId:updated.hotelId,active:updated.active})}});
      return NextResponse.json(updated);
    }

    const old = await prisma.user.findUnique({where:{id}});
    if (!old) throw new Error('User tidak ditemukan');
    if (!x.name?.trim() || !x.username?.trim()) throw new Error('Nama dan username wajib diisi');
    if (!['SUPER_ADMIN','ADMIN','DRIVER'].includes(x.role)) throw new Error('Role tidak valid');
    if (old.id === u.id && !x.active) throw new Error('Anda tidak dapat menonaktifkan akun sendiri');
    if (old.id === u.id && x.role !== 'SUPER_ADMIN') throw new Error('Anda tidak dapat menurunkan role akun sendiri');
    if (old.role === 'SUPER_ADMIN' && (x.role !== 'SUPER_ADMIN' || !x.active)) {
      const count = await prisma.user.count({where:{role:'SUPER_ADMIN',active:true}});
      if (count <= 1) throw new Error('Minimal harus ada 1 Super Admin aktif');
    }
    if (x.role==='DRIVER'&&!x.driverId) throw new Error('Driver wajib dipilih untuk user DRIVER');
    const data:any = {username:x.username.trim(), name:x.name.trim(), role:x.role, hotelId:x.hotelId || null, active:Boolean(x.active)};
    if (x.password?.trim()) data.passwordHash = await bcrypt.hash(x.password.trim(), 12);
    data.driver = x.role==='DRIVER' ? {connect:{id:x.driverId}} : {disconnect:true};
    const updated = await prisma.user.update({where:{id}, data});
    await prisma.auditLog.create({data:{userId:u.id, action:'EDIT_USER', oldValue:JSON.stringify({username:old.username,name:old.name,role:old.role,hotelId:old.hotelId,active:old.active}), newValue:JSON.stringify({username:updated.username,name:updated.name,role:updated.role,hotelId:updated.hotelId,active:updated.active}), notes:x.password?.trim()?'Password juga direset':''}});
    return NextResponse.json({id:updated.id,username:updated.username,name:updated.name,role:updated.role,hotelId:updated.hotelId,active:updated.active});
  } catch (e:any) {
    const msg = e?.code === 'P2002' ? 'Data sudah digunakan.' : e?.message || 'Gagal menyimpan perubahan';
    return NextResponse.json({error:msg}, {status:400});
  }
}
