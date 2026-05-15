// netlify/functions/payment-webhook.js
// Recebe notificações de pagamento do MercadoPago (gratuito até certo volume)
// Endpoint: https://seusite.netlify.app/.netlify/functions/payment-webhook
//
// Configure no painel do MercadoPago:
//   Webhooks → URL de notificação → cole o endpoint acima
//
// Variáveis de ambiente necessárias (painel Netlify → Site settings → Env vars):
//   MP_ACCESS_TOKEN  — token do MercadoPago
//   SUPABASE_URL     — URL do projeto Supabase (opcional, para persistência)
//   SUPABASE_KEY     — chave anon do Supabase

const https = require('https');

async function mpGet(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mercadopago.com',
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    https.get(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, data } = body;

    // Apenas processa notificações de pagamento
    if (type !== 'payment' || !data?.id) {
      return { statusCode: 200, body: 'ignored' };
    }

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return { statusCode: 200, body: 'no token' };

    // Consulta o pagamento na API do MercadoPago
    const payment = await mpGet(`/v1/payments/${data.id}`, token);

    const result = {
      mp_id:        payment.id,
      status:       payment.status,           // approved / pending / rejected
      amount:       payment.transaction_amount,
      email:        payment.payer?.email,
      external_ref: payment.external_reference, // orderId que você enviou
      method:       payment.payment_type_id,
      updated_at:   new Date().toISOString(),
    };

    console.log('[Webhook] Pagamento recebido:', JSON.stringify(result));

    // Se aprovado → (opcional) atualizar Supabase
    if (payment.status === 'approved' && process.env.SUPABASE_URL) {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${result.external_ref}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ status: 'approved', mp_payment_id: result.mp_id }),
      });
    }

    return { statusCode: 200, body: JSON.stringify({ received: true, status: payment.status }) };
  } catch (err) {
    console.error('[Webhook] Erro:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
