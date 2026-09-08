import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const u = await getSession();

    if (!u) {
      throw new Error("Unauthorized");
    }

    const { id } = await req.json();

    if (!id) {
      throw new Error("Booking ID wajib diisi");
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new Error("Booking tidak ditemukan");
    }

    // Hanya driver yang ditugaskan
    // yang boleh melakukan reject
    if (u.role !== "DRIVER" || booking.driverId !== u.driverId) {
      throw new Error("Forbidden");
    }

    // Booking dengan status berikut
    // tidak dapat di-reject kembali
    if (
      booking.status === "COMPLETED" ||
      booking.status === "CANCELLED" ||
      booking.status === "RELEASED" ||
      booking.status === "REJECTED"
    ) {
      throw new Error(
        `Booking dengan status ${booking.status} tidak dapat di-reject`
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
    });

    await prisma.auditLog.create({
      data: {
        bookingId: id,
        userId: u.id,
        action: "REJECT",
        oldValue: booking.status,
        newValue: "REJECTED",
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e?.message || "Gagal melakukan reject booking",
      },
      {
        status: 400,
      }
    );
  }
}
