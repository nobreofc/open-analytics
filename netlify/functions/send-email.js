// netlify/functions/send-email.js
// Envia e-mail de confirmação de compra via EmailJS (gratuito)
// Configure as variáveis de ambiente no painel Netlify:
//   EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY

const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { to, name, orderId, items, total, method } = JSON.parse(event.body);

    // EmailJS REST API (plano gratuito: 200 e-mails/mês)
    const payload = JSON.stringify({
      service_id:  process.env.EMAILJS_SERVICE_ID  || 'service_openanalytics',
      template_id: process.env.EMAILJS_TEMPLATE_ID || 'template_order_confirm',
      user_id:     process.env.EMAILJS_PUBLIC_KEY  || '',
      template_params: {
        to_email:    to,
        to_name:     name,
        order_id:    orderId,
        order_items: items.map(i => `${i.emoji} ${i.name} — R$ ${i.price.toFixed(2)}`).join('\n'),
        order_total: `R$ ${total.toFixed(2)}`,
        pay_method:  method === 'card' ? 'Cartão de crédito' : method === 'pix' ? 'Pix' : 'Boleto',
        download_url: `https://openanalytics.netlify.app/#downloads`,
      },
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.emailjs.com',
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, emailStatus: result.status }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
