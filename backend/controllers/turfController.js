import prisma from '../config/db.js';

// @desc    Get all turfs with advanced search, filters, pagination
// @route   GET /api/turfs
// @access  Public
const getAllTurfs = async (req, res, next) => {
  try {
    const { search, location, minPrice, maxPrice, minRating, ownerId, page = 1, limit = 9 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter query object
    const where = {};

    // Filter by Owner ID if supplied
    if (ownerId) {
      where.ownerId = ownerId;
    }

    // Search term matching name/description/address
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Exact city location matching
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Price Filtering
    if (minPrice || maxPrice) {
      where.pricePerHour = {};
      if (minPrice) where.pricePerHour.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerHour.lte = parseFloat(maxPrice);
    }

    // Rating Filtering
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    // Fetch records & count
    const [turfs, total] = await prisma.$transaction([
      prisma.turf.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.turf.count({ where }),
    ]);

    res.json({
      turfs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single turf by ID with full details (slots, reviews)
// @route   GET /api/turfs/:id
// @access  Public
const getTurfById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const turf = await prisma.turf.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        slots: {
          orderBy: { startTime: 'asc' },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    res.json(turf);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new turf listing & auto-generate booking slots
// @route   POST /api/turfs
// @access  Private (Owner/Admin)
const createTurf = async (req, res, next) => {
  try {
    const { name, description, location, address, pricePerHour, images, amenities } = req.body;
    const ownerId = req.user.id;

    // Standard list of initial photos if empty
    const turfImages = images && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540747737956-37872ce3f862?w=800&auto=format&fit=crop&q=80'
    ];

    // Create turf
    const turf = await prisma.turf.create({
      data: {
        name,
        description,
        location,
        address,
        pricePerHour: parseFloat(pricePerHour),
        images: turfImages,
        amenities: amenities || [],
        ownerId,
      },
    });

    // Auto-generate booking slots for standard cricket timings: 06:00 to 22:00
    const startHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
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

    // Fetch full turf with generated slots
    const fullTurf = await prisma.turf.findUnique({
      where: { id: turf.id },
      include: { slots: true },
    });

    res.status(201).json({
      message: 'Turf listing created successfully. Hourly slots generated.',
      turf: fullTurf,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a turf listing
// @route   PUT /api/turfs/:id
// @access  Private (Owner/Admin)
const updateTurf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, location, address, pricePerHour, images, amenities } = req.body;

    const turf = await prisma.turf.findUnique({ where: { id } });
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Check authority
    if (turf.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this turf' });
    }

    const updatedTurf = await prisma.turf.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        location: location || undefined,
        address: address || undefined,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined,
        images: images || undefined,
        amenities: amenities || undefined,
      },
    });

    res.json({
      message: 'Turf updated successfully',
      turf: updatedTurf,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a turf listing
// @route   DELETE /api/turfs/:id
// @access  Private (Owner/Admin)
const deleteTurf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const turf = await prisma.turf.findUnique({ where: { id } });
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Check authority
    if (turf.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this turf' });
    }

    await prisma.turf.delete({ where: { id } });

    res.json({ message: 'Turf listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  getAllTurfs,
  getTurfById,
  createTurf,
  updateTurf,
  deleteTurf,
};
