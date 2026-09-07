-- Initial PostgreSQL schema for Internal Taxi Booking
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DRIVER');
CREATE TYPE "BookingType" AS ENUM ('BOOKING', 'TENTATIVE', 'CONFIRM');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_DRIVER', 'CONFIRMED', 'RELEASED', 'CANCELLED', 'COMPLETED', 'REJECTED');

CREATE TABLE "Hotel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Hotel_name_key" ON "Hotel"("name");

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "hotelId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

CREATE TABLE "Driver" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "hotelId" TEXT NOT NULL,
  "userId" TEXT,
  CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

CREATE TABLE "Vehicle" (
  "id" TEXT NOT NULL,
  "vehicleType" TEXT NOT NULL,
  "plateNumber" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "hotelId" TEXT NOT NULL,
  CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

CREATE TABLE "Booking" (
  "id" TEXT NOT NULL,
  "bookingNumber" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT,
  "pickupLocation" TEXT,
  "destination" TEXT,
  "bookingDate" TIMESTAMP(3) NOT NULL,
  "pickupTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "bookingType" "BookingType" NOT NULL DEFAULT 'BOOKING',
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_DRIVER',
  "vehicleId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "price" DECIMAL(14,2) NOT NULL,
  "notes" TEXT,
  "createdById" TEXT NOT NULL,
  "confirmedAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");
CREATE INDEX "Booking_hotelId_bookingDate_idx" ON "Booking"("hotelId", "bookingDate");
CREATE INDEX "Booking_vehicleId_pickupTime_endTime_idx" ON "Booking"("vehicleId", "pickupTime", "endTime");
CREATE INDEX "Booking_driverId_pickupTime_endTime_idx" ON "Booking"("driverId", "pickupTime", "endTime");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "oldValue" TEXT,
  "newValue" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD CONSTRAINT "User_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
