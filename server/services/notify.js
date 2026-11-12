const supabase = require('../config/supabase');

const STATUS_NOTICE = {
  accepted:   { title: 'Request accepted',      kind: 'success', body: (c) => `${c} accepted your recycling request.` },
  processing: { title: 'Recycling in progress', kind: 'info',    body: (c) => `${c} has started processing your items.` },
  completed:  { title: 'Recycling completed',   kind: 'success', body: (c) => `Your request with ${c} is completed. Your certificate is ready.` },
  rejected:   { title: 'Request declined',      kind: 'info',    body: (c) => `${c} could not accept your request.` }
};

// Notifications must never break the main action, so failures are only logged.
async function notify(rows) {
  const list = [].concat(rows).filter(Boolean);
  if (!list.length) return;
  try {
    const { error } = await supabase.from('notifications').insert(list);
    if (error) console.error('Notification insert failed:', error.message);
  } catch (e) {
    console.error('Notification failed:', e.message);
  }
}

module.exports = { notify, STATUS_NOTICE };
