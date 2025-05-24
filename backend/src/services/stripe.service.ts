import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {BookingsService} from "./bookings.service";
import {ConfigService} from "@nestjs/config";
import {session} from "passport";
import {MailService} from "./mail.service";
import axios from "axios";

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private readonly bookingsService: BookingsService,
                private readonly configService: ConfigService,
                private readonly mailService: MailService) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-04-30.basil',
        });
    }

    async createCheckoutSession(data: {
        bookingId: string;
        amount: number;
    }) {
        const booking = await this.bookingsService.findOne(data.bookingId);
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
            customer_email: booking.user.email,
            payment_intent_data: {
                receipt_email: booking.user.email, // Явно указываем email для чека
            },
            invoice_creation: {
                enabled: true, // Включаем автоматическое создание инвойса
            },
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
            const booking = await this.bookingsService.findOne(bookingId);

                const invoice = await this.stripe.invoices.retrieve(session.invoice as string);

                await this.mailService.sendInvoiceLink({
                    to: booking.user.email,
                    pdfUrl: invoice.invoice_pdf,
                    invoiceNumber: invoice.number,
                    userName: booking.user.firstName + ' ' + booking.user.lastName,
                    serviceTitle: `Бронирование #${bookingId}`
                });

                await this.bookingsService.update(bookingId, { status: 'PAID' });
        }
    }

    getStripe() {
        return this.stripe;
    }
}
