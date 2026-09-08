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

    // Hanya driver yang ditugaskan boleh menyelesaikan booking
    if (u.role === "DRIVER" && booking.driverId !== u.driverId) {
      throw new Error("Forbidden");
    }

    // Booking yang sudah selesai atau dibatalkan
    // tidak dapat diselesaikan kembali.
    if (
      booking.status === "COMPLETED" ||
      booking.status === "CANCELLED" ||
      booking.status === "RELEASED" ||
      booking.status === "REJECTED"
    ) {
      throw new Error(
        `Booking dengan status ${booking.status} tidak dapat diselesaikan`
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "COMPLETED",
      },
    });

    await prisma.auditLog.create({
      data: {
        bookingId: id,
        userId: u.id,
        action: "COMPLETE",
        oldValue: booking.status,
        newValue: "COMPLETED",
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e?.message || "Gagal menyelesaikan booking",
      },
      {
        status: 400,
      }
    );
  }
}
