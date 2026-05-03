const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getTicketStatusBreakdown,
} = require("../services/ticketService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

const listTickets = asyncHandler(async (req, res) => {
  const result = await getTickets(req.user.tenantId, req.query);
  sendSuccess(res, result, "Tickets retrieved.");
});

const getTicket = asyncHandler(async (req, res) => {
  const ticket = await getTicketById(req.user.tenantId, req.params.id);
  sendSuccess(res, { ticket }, "Ticket retrieved.");
});

const create = asyncHandler(async (req, res) => {
  console.log('=== TICKET CREATION DEBUG ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User object:', {
    id: req.user._id,
    tenantId: req.user.tenantId,
    role: req.user.role,
    email: req.user.email
  });
  
  // Validate required fields before calling service
  if (!req.body.title || req.body.title.trim() === '') {
    console.log('❌ Title is missing or empty');
    throw new AppError('Title is required', 422);
  }
  
  if (!req.user.tenantId) {
    console.log('❌ User tenantId is missing');
    throw new AppError('User tenant ID is missing', 422);
  }
  
  console.log('✅ Basic validation passed, calling service...');
  
  try {
    const ticket = await createTicket(req.user.tenantId, req.body, req.user._id);
    console.log('✅ Ticket created successfully:', ticket._id);
    sendCreated(res, { ticket }, "Ticket created.");
  } catch (error) {
    console.error('❌ Ticket creation error:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      stack: error.stack
    });
    throw error;
  }
});

const update = asyncHandler(async (req, res) => {
  const ticket = await updateTicket(
    req.user.tenantId,
    req.params.id,
    req.body,
    req.user._id
  );
  sendSuccess(res, { ticket }, "Ticket updated.");
});

const statusBreakdown = asyncHandler(async (req, res) => {
  const data = await getTicketStatusBreakdown(req.user.tenantId);
  sendSuccess(res, { breakdown: data }, "Status breakdown retrieved.");
});

module.exports = { listTickets, getTicket, create, update, statusBreakdown };