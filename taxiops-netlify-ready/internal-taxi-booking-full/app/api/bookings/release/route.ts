import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const u = await getSession();

    if (!u) {
      throw new Error("Unauthorized");
    }

    // Release hanya boleh dilakukan oleh ADMIN / SUPER_ADMIN
    if (u.role !== "ADMIN" && u.role !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
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

    // Hanya booking CONFIRM yang dapat di-release
    if (booking.status !== "CONFIRMED") {
      throw new Error(
        `Booking dengan status ${booking.status} tidak dapat di-release`
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "RELEASED",
        releasedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        bookingId: id,
        userId: u.id,
        action: "RELEASE",
        oldValue: booking.status,
        newValue: "RELEASED",
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e?.message || "Gagal melakukan release booking",
      },
      {
        status: 400,
      }
    );
  }
}
