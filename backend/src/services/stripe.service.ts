import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {BookingsService} from "./bookings.service";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private readonly bookingsService: BookingsService,
                private readonly configService: ConfigService) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-04-30.basil',
        });
    }

    async createCheckoutSession(data: {
        bookingId: string;
        amount: number;
    }) {
        return this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Booking #${data.bookingId}`,
                        },
                        unit_amount: data.amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                bookingId: data.bookingId,
            },
            success_url: 'http://localhost:3001/bookings',
            cancel_url: 'http://localhost:3001/',
        });
    }

    constructEvent(rawBody: Buffer, signature: string) {
        return this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    }

    async handleWebhook(event: Stripe.Event) {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const bookingId = session.metadata.bookingId;

            await this.bookingsService.update(bookingId, {status: 'PAID'});
        }
    }

    getStripe() {
        return this.stripe;
    }
}
