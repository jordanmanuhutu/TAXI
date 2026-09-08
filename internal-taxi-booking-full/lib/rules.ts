import {prisma} from './prisma';
export async function assertNoConfirmedOverlap(args:{vehicleId:string;driverId:string;pickupTime:Date;endTime:Date;excludeId?:string}){
 const {vehicleId,driverId,pickupTime,endTime,excludeId}=args;
 const hits=await prisma.booking.findMany({where:{status:'CONFIRMED',id:excludeId?{not:excludeId}:undefined,pickupTime:{lt:endTime},endTime:{gt:pickupTime},OR:[{vehicleId},{driverId}]},select:{id:true,bookingNumber:true,vehicleId:true,driverId:true}});
 if(hits.length) throw new Error(`Jadwal bentrok dengan ${hits.map(x=>x.bookingNumber).join(', ')}`);
}
export async function makeBookingNumber(){const d=new Date();const p=`TX-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;const count=await prisma.booking.count({where:{createdAt:{gte:new Date(d.getFullYear(),d.getMonth(),d.getDate())}}});return `${p}-${String(count+1).padStart(4,'0')}`}
