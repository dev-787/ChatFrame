const { Ticket } = require("../models/Ticket");
const Message = require("../models/Message");
const AppError = require("../utils/AppError");

/**
 * Get conversation list (open + in_progress tickets with last message).
 */
const getConversations = async (tenantId, query = {}, user = null) => {
  const { status = "open,in_progress", page = 1, limit = 30 } = query;

  const statuses = status.split(",").map((s) => s.trim());
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { tenantId, status: { $in: statuses } };

  // If user is a support agent, restrict conversations to those assigned to them
  if (user && user.role === "support_agent") {
    filter.assignedTo = user._id;
  }

  const tickets = await Ticket.find(filter)
    .populate("assignedTo", "firstName lastName")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Attach last message to each ticket
  const ticketIds = tickets.map((t) => t._id);
  const lastMessages = await Message.aggregate([
    { $match: { ticketId: { $in: ticketIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$ticketId",
        content: { $first: "$content" },
        senderType: { $first: "$senderType" },
        createdAt: { $first: "$createdAt" },
      },
    },
  ]);

  const lastMsgMap = {};
  lastMessages.forEach((m) => {
    lastMsgMap[m._id.toString()] = {
      content: m.content,
      senderType: m.senderType,
      createdAt: m.createdAt,
    };
  });

  const conversations = tickets.map((t) => ({
    ...t,
    lastMessage: lastMsgMap[t._id.toString()] || null,
  }));

  return conversations;
};

/**
 * Get all messages for a ticket (conversation thread).
 */
const getMessages = async (tenantId, ticketId, user = null) => {
  // Verify ticket belongs to tenant
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId })
    .populate("assignedTo", "firstName lastName email role");
  if (!ticket) throw new AppError("Conversation not found.", 404);

  // Access control:
  // Support agent cannot view a conversation assigned to a different agent.
  if (user && user.role === "support_agent") {
    const assignedUserId = ticket.assignedTo?._id || ticket.assignedTo;
    if (assignedUserId && String(assignedUserId) !== String(user._id)) {
      throw new AppError("Access denied. This ticket is assigned to another agent.", 403);
    }
  }

  const messages = await Message.find({ tenantId, ticketId })
    .populate("senderId", "firstName lastName role")
    .sort({ createdAt: 1 })
    .lean();

  return { ticket, messages };
};

/**
 * Send a message in a ticket conversation.
 */
const sendMessage = async (tenantId, ticketId, { content, senderId, senderType, isAiGenerated = false, aiConfidence = null }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, tenantId });
  if (!ticket) throw new AppError("Ticket not found.", 404);

  const message = await Message.create({
    tenantId,
    ticketId,
    senderId: senderId || null,
    senderType,
    content,
    isAiGenerated,
    aiConfidence,
  });

  // Set firstResponseAt if agent responds for the first time
  if (senderType === "agent" && !ticket.firstResponseAt) {
    ticket.firstResponseAt = new Date();
    await ticket.save({ validateBeforeSave: false });
  }

  // Move ticket to in_progress when agent first responds
  if (senderType === "agent" && ticket.status === "open") {
    ticket.status = "in_progress";
    await ticket.save({ validateBeforeSave: false });
  }

  await message.populate("senderId", "firstName lastName role");

  return message;
};

module.exports = { getConversations, getMessages, sendMessage };