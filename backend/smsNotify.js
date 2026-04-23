/**
 * Notify seller of a new bid via SMS.
 * Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (E.164) for real sends.
 * Otherwise logs a demo message to the server console.
 */
async function sendNewBidSms({ toDigits, itemTitle, amount }) {
  const digits = String(toDigits || '').replace(/\D/g, '');
  if (digits.length !== 10) {
    console.log('[EcoTrade SMS] skipped — listing has no valid 10-digit phone');
    return;
  }

  const title = (itemTitle || 'your listing').slice(0, 45);
  const body = `EcoTrade: New bid of ₹${Number(amount).toLocaleString('en-IN')} on "${title}". Open your seller dashboard to respond.`;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && from) {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const to = digits.length === 10 ? `+91${digits}` : `+${digits}`;
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[EcoTrade SMS] Twilio error:', res.status, errText);
    }
    return;
  }

  console.log('[EcoTrade SMS demo — set TWILIO_* env vars for real SMS]', {
    to: `+91${digits}`,
    body,
  });
}

module.exports = { sendNewBidSms };
