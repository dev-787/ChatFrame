const { Ticket, TICKET_STATUS } = require("../models/Ticket");
const { Notification } = require("../models/Notification");
const AppError = require("../utils/AppError");

/**
 * Get paginated, filtered ticket list for a tenant.
 */
const getTickets = async (tenantId, query = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    assignedTo,
    channel,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = { tenantId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (channel) filter.channel = channel;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
      { customerEmail: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortDir = sortOrder === "asc" ? 1 : -1;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName")
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get a single ticket by ID with messages.
 */
const getTicketById = async (tenantId, ticketId) => {
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId })
    .populate("assignedTo", "firstName lastName email role")
    .populate("createdBy", "firstName lastName");

  if (!ticket) throw new AppError("Ticket not found.", 404);
  return ticket;
};

/**
 * Create a new ticket.
 */
const createTicket = async (tenantId, data, createdBy = null) => {
  console.log('Creating ticket in service with:', { tenantId, data, createdBy });
  
  try {
    const ticket = await Ticket.create({
      tenantId,
      ...data,
      createdBy,
    });
    
    console.log('Ticket created successfully:', ticket);
    return ticket;
  } catch (error) {
    console.error('Mongoose validation error:', error);
    throw error;
  }
};

/**
 * Update ticket fields (status, priority, assignedTo, etc.)
 */
const updateTicket = async (tenantId, ticketId, updates, actorId) => {
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId });
  if (!ticket) throw new AppError("Ticket not found.", 404);

  const prevStatus = ticket.status;

  // Apply updates
  Object.assign(ticket, updates);

  // Set resolvedAt when moving to resolved/closed
  if (
    ["resolved", "closed"].includes(updates.status) &&
    !["resolved", "closed"].includes(prevStatus)
  ) {
    ticket.resolvedAt = new Date();
  }

  await ticket.save();

  // Emit notification on escalation
  if (updates.status === "escalated" && prevStatus !== "escalated") {
    await Notification.create({
      tenantId,
      userId: ticket.assignedTo || actorId,
      type: "ticket_escalated",
      title: "Ticket Escalated",
      message: `Ticket #${ticket.ticketNumber} has been escalated.`,
      metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
    });
  }

  // Notification on assignment
  if (updates.assignedTo && updates.assignedTo !== String(ticket.assignedTo)) {
    await Notification.create({
      tenantId,
      userId: updates.assignedTo,
      type: "ticket_assigned",
      title: "Ticket Assigned",
      message: `Ticket #${ticket.ticketNumber} has been assigned to you.`,
      metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
    });
  }

  return ticket;
};

/**
 * Get ticket status distribution for a tenant.
 */
const getTicketStatusBreakdown = async (tenantId) => {
  return Ticket.aggregate([
    { $match: { tenantId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
  ]);
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getTicketStatusBreakdown,
};