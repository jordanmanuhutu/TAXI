import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";
import { redirect } from "next/navigation";
import Form from "./form";

export default async function NewBooking() {
  const u = await getSession();

  if (!u || u.role === "DRIVER") {
    redirect("/bookings");
  }

  const hotels = await prisma.hotel.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const vehicleWhere =
    u.role === "ADMIN" && u.hotelId
      ? {
          active: true,
          hotelId: u.hotelId,
        }
      : {
          active: true,
        };

  const driverWhere =
    u.role === "ADMIN" && u.hotelId
      ? {
          active: true,
          hotelId: u.hotelId,
        }
      : {
          active: true,
        };

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    orderBy: {
      plateNumber: "asc",
    },
  });

  const drivers = await prisma.driver.findMany({
    where: driverWhere,
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="wrap">
      <div className="top">
        <div>
          <h1>New Booking</h1>
          <p className="muted">
            Admin membuat order, driver wajib confirm sebelum vehicle terkunci.
          </p>
        </div>
      </div>

      <Form
        role={u.role}
        hotels={hotels}
        vehicles={vehicles}
        drivers={drivers}
      />
    </main>
  );
}
