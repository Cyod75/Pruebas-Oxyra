// Fallback para evitar que la aplicación crashee si la clave aún no está en .env
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(stripeSecretKey);
const db = require('../config/db');

exports.createPaymentIntent = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // El importe de la suscripción mensual es 9.99€ -> 999 céntimos.
        const amount = 999; 
        const currency = 'eur';

        // Creamos un Customer de Stripe si no tuviera uno (opcional, pero útil).
        // Por simplicidad, aquí lo creamos on the fly o guardamos el intent con metadata.
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true, 
            },
            metadata: {
                userId: userId.toString(), 
                type: 'pro_subscription'
            }
        });

        // Devolvemos el secreto_cliente (client_secret) al Frontend
        res.json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- WEBHOOK PARA RECIBIR CONFIRMACIÓN SEGURA DE STRIPE ---
// Este endpoint no usa req.body en formato JSON. Usa Buffer raw en el server.js.
exports.stripeWebhook = async (req, res) => {
    const rawBody = req.body;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Stripe verifica que la llamada viene de ellos usando tu webhook secret.
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;
        const type = paymentIntent.metadata.type;

        if (userId && type === 'pro_subscription') {
            console.log(`Pago recibido para el usuario ${userId}`);
            try {
                // Activar suscripción Pro (1 mes)
                const fechaFin = new Date();
                fechaFin.setDate(fechaFin.getDate() + 30);
        
                await db.query(
                    "UPDATE usuarios SET es_pro = 1, fecha_fin_suscripcion = ? WHERE idUsuario = ?", 
                    [fechaFin, userId]
                );
                console.log(`Usuario ${userId} es ahora PRO.`);
            } catch (dbErr) {
                console.error("Error al actualizar la base de datos tras pago:", dbErr);
            }
        }
    }

    res.json({ received: true });
};

// --- SUBSCRIPTION INFO (para mostrar la página de gestión) ---
exports.getSubscriptionInfo = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtenemos datos básicos del usuario desde la BD
        const [rows] = await db.query(
            'SELECT es_pro, fecha_fin_suscripcion FROM usuarios WHERE idUsuario = ?',
            [userId]
        );

        if (!rows.length || !rows[0].es_pro) {
            return res.status(404).json({ error: 'No tiene suscripción activa' });
        }

        const user = rows[0];
        const fechaFin = user.fecha_fin_suscripcion;
        const currentPeriodEnd = fechaFin ? Math.floor(new Date(fechaFin).getTime() / 1000) : null;

        let paymentMethod = null;

        // Si hay un customer de Stripe, intentamos obtener el método de pago real
        if (user.stripe_customer_id) {
            try {
                const customer = await stripe.customers.retrieve(user.stripe_customer_id, {
                    expand: ['default_source', 'invoice_settings.default_payment_method']
                });

                const pm = customer.invoice_settings?.default_payment_method;
                if (pm && pm.card) {
                    paymentMethod = {
                        brand: pm.card.brand,
                        last4: pm.card.last4,
                        expMonth: pm.card.exp_month,
                        expYear: pm.card.exp_year,
                    };
                }
            } catch (stripeErr) {
                console.warn('No se pudo obtener info de Stripe Customer:', stripeErr.message);
            }
        }

        res.json({
            plan: {
                name: 'Oxyra Pro',
                amount: 999,         // céntimos
                currency: 'eur',
                interval: 'month',
            },
            currentPeriodEnd,
            paymentMethod,
            autoRenew: true,
        });

    } catch (error) {
        console.error('Error getSubscriptionInfo:', error);
        res.status(500).json({ error: error.message });
    }
};
