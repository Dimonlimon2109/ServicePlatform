import {
    Controller, Post, Req, Res, HttpCode, RawBodyRequest
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import Stripe from 'stripe';
import { StripeService } from '../services/stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @Post('webhook')
    @HttpCode(200)
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<ExpressRequest & { body: Buffer }>,
        @Res() res: Response,
    ) {
        console.log('Webhook received');
        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;

        try {
            event = this.stripeService.getStripe().webhooks.constructEvent(
                req.body, // тело будет Buffer, т.к. app.use('/stripe/webhook', raw(...)) установлен
                sig,
                process.env.STRIPE_WEBHOOK_SECRET,
            );
        } catch (err) {
            console.error('Webhook error:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        await this.stripeService.handleWebhook(event);
        return res.json({ received: true });
    }
}
