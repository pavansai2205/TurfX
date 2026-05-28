import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Wiping existing database records...');
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.slot.deleteMany({});
  await prisma.turf.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Database clean completed.');

  console.log('🌱 Hashing passwords & seeding users...');
  const salt = await bcrypt.genSalt(10);
  const userPassword = await bcrypt.hash('password123', salt);
  const ownerPassword = await bcrypt.hash('password123', salt);
  const adminPassword = await bcrypt.hash('password123', salt);

  // 1. Seed Users
  const userCustomer = await prisma.user.create({
    data: {
      name: 'Rahul Kumar',
      email: 'user@example.com',
      password: userPassword,
      phone: '+91 9876543210',
      role: 'USER',
      profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul',
    },
  });

  const userOwner = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      email: 'owner@example.com',
      password: ownerPassword,
      phone: '+91 9123456789',
      role: 'TURF_OWNER',
      profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram',
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: adminPassword,
      phone: '+91 9999999999',
      role: 'ADMIN',
      profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin',
    },
  });

  console.log('✅ Users seeded successfully.');

  // 2. Seed Turfs
  console.log('🌱 Seeding turf listings...');
  const turf1 = await prisma.turf.create({
    data: {
      name: 'Wankhede Turf Arena',
      description: 'Experience professional-grade astro-turf suitable for 8v8 leather ball or tennis ball cricket. Featuring state-of-the-art night floodlights, secure dugout seating, locker rooms, and an on-site sports cafe.',
      location: 'Mumbai',
      address: 'Churchgate, near Wankhede Stadium, Marine Drive, Mumbai 400020',
      pricePerHour: 1500.0,
      images: [
        'https://images.unsplash.com/photo-1540747737956-37872ce3f862?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
      ],
      amenities: ['Floodlights', 'Changing Rooms', 'Drinking Water', 'Equipment Rental', 'Cafe', 'Free Parking'],
      rating: 4.8,
      ownerId: userOwner.id,
    },
  });

  const turf2 = await prisma.turf.create({
    data: {
      name: 'Chinnaswamy Turf Greens',
      description: 'Premium pitch featuring high-performance grass blades that prevent friction burns. Perfect for intensive training camps or corporate cricket fixtures. Features standard boundary markings and umpire decks.',
      location: 'Bangalore',
      address: 'MG Road, opposite Cubbon Park, Bangalore 560001',
      pricePerHour: 1200.0,
      images: [
        'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
      ],
      amenities: ['Floodlights', 'Drinking Water', 'Restrooms', 'Spectator Stand', 'First Aid'],
      rating: 4.5,
      ownerId: userOwner.id,
    },
  });

  const turf3 = await prisma.turf.create({
    data: {
      name: 'Feroz Shah Turf Ground',
      description: 'Spacious multi-sports facility hosting a high-density, green turf. Highly favored for under-arm or over-arm cricket clashes. Clean changing zones, secure boundaries, and dynamic sound systems.',
      location: 'Delhi',
      address: 'Vikram Nagar, near Feroz Shah Kotla, New Delhi 110002',
      pricePerHour: 1000.0,
      images: [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540747737956-37872ce3f862?w=800&auto=format&fit=crop&q=80'
      ],
      amenities: ['Floodlights', 'Restrooms', 'Drinking Water', 'Locker Rooms', 'Sound System'],
      rating: 4.2,
      ownerId: userOwner.id,
    },
  });

  console.log('✅ Turf listings seeded successfully.');

  // 3. Seed Slots for each turf (06:00 to 22:00)
  console.log('🌱 Seeding slots for all turfs...');
  const turfs = [turf1, turf2, turf3];
  const startHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  for (const turf of turfs) {
    const slotsData = startHours.map((hour) => {
      const formatHour = (h) => String(h).padStart(2, '0');
      return {
        turfId: turf.id,
        startTime: `${formatHour(hour)}:00`,
        endTime: `${formatHour(hour + 1)}:00`,
      };
    });

    await prisma.slot.createMany({
      data: slotsData,
    });
  }

  console.log('✅ Hourly slots seeded successfully.');

  // Retrieve some slots to seed sample bookings
  const wankhedeSlots = await prisma.slot.findMany({ where: { turfId: turf1.id } });
  const chinnaswamySlots = await prisma.slot.findMany({ where: { turfId: turf2.id } });

  // 4. Seed Booking & Payments
  console.log('🌱 Seeding bookings & reviews...');
  const targetDate = new Date();
  targetDate.setHours(0, 0, 0, 0);

  // Booking 1: Confirmed
  const booking1 = await prisma.booking.create({
    data: {
      userId: userCustomer.id,
      turfId: turf1.id,
      slotId: wankhedeSlots[10].id, // 16:00 - 17:00
      bookingDate: targetDate,
      totalPrice: turf1.pricePerHour,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      razorpayOrderId: 'order_test123',
      razorpayPaymentId: 'pay_test123',
      amount: turf1.pricePerHour,
      paymentStatus: 'PAID',
    },
  });

  // Booking 2: Pending
  await prisma.booking.create({
    data: {
      userId: userCustomer.id,
      turfId: turf2.id,
      slotId: chinnaswamySlots[12].id, // 18:00 - 19:00
      bookingDate: targetDate,
      totalPrice: turf2.pricePerHour,
      bookingStatus: 'PENDING',
      paymentStatus: 'PENDING',
    },
  });

  // 5. Seed Reviews
  await prisma.review.create({
    data: {
      userId: userCustomer.id,
      turfId: turf1.id,
      rating: 5,
      comment: 'Absolutely amazing stadium quality field! The floodlights are bright, and the ground surface is perfect for batting.',
    },
  });

  await prisma.review.create({
    data: {
      userId: userCustomer.id,
      turfId: turf2.id,
      rating: 4,
      comment: 'Excellent customer service. The batting surface is reliable, and they provide spare leather cricket balls. Recommended!',
    },
  });

  console.log('✅ Bookings, Payments & Reviews seeded.');
  console.log('🎉 Database seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding error occurred:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
