import prisma from '../config/db.js';

// @desc    Get platform-wide admin analytics dashboard metrics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalOwners = await prisma.user.count({ where: { role: 'TURF_OWNER' } });
    const totalTurfs = await prisma.turf.count();
    
    // Total Bookings and Earnings aggregates
    const totalBookings = await prisma.booking.count();
    const paidBookings = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalPrice: true },
    });

    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Recent Bookings (limit 5)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        turf: { select: { name: true } },
        slot: { select: { startTime: true, endTime: true } },
      },
    });

    // Recent Users (limit 5)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({
      metrics: {
        totalUsers,
        totalOwners,
        totalTurfs,
        totalBookings,
        totalRevenue,
      },
      recentBookings,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a user's role (USER <-> TURF_OWNER)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const toggleUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'TURF_OWNER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role code' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({
      message: `User role changed to ${role} successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin override)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Self-deletion of administrator account is blocked' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User account has been permanently removed from the system' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all system-wide bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        turf: { select: { name: true, location: true, ownerId: true } },
        slot: { select: { startTime: true, endTime: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export {
  getAdminAnalytics,
  getAllUsers,
  toggleUserRole,
  deleteUser,
  getAllBookings,
};
