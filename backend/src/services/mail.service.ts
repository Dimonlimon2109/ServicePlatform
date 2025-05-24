import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import axios from "axios";

@Injectable()
export class MailService {
    constructor(private readonly configService: ConfigService) {}

    private readonly logger = new Logger(MailService.name);

    private transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: false,
        auth: {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
        },
    });

    private statusMap = {
        PENDING: 'Ожидает подтверждения',
        CONFIRMED: 'Подтверждена',
        CANCELLED: 'Отменена',
        COMPLETED: 'Выполнена',
    };

    async sendInvoiceLink({
                              to,
                              pdfUrl,
                              invoiceNumber,
                              userName,
                              serviceTitle,
                          }: {
        to: string;
        pdfUrl: string;
        invoiceNumber: string;
        userName: string;
        serviceTitle: string;
    }) {
        const subject = `Квитанция об оплате услуги "${serviceTitle}"`;
        const text = `${userName}, ваша квитанция об оплате услуги "${serviceTitle}" готова.\n
                      Номер квитанции: ${invoiceNumber}
                      Ссылка для скачивания: ${pdfUrl}

                      С уважением, 
                      Платформа предоставления услуг`;
        try {
            await this.transporter.sendMail({
                from: `Платформа бронирования услуг`,
                to,
                subject,
                text,
            });

            this.logger.log(`Ссылка на квитанцию для услуги "${serviceTitle}" отправлена на ${to}`);
        } catch (error) {
            this.logger.error('Ошибка при отправке ссылки на квитанцию:', error);
            throw error;
        }
    }

    async sendOrderStatusChangeEmail({
                                         to,
                                         userName,
                                         serviceTitle,
                                         newStatus,
                                         providerName,
                                     }: {
        to: string;
        userName: string;
        serviceTitle: string;
        newStatus: string;
        providerName: string;
    }) {
        const subject = `Обновление статуса бронирования услуги "${serviceTitle}"`;
        const text = `${userName}, забронированная вами услуга "${serviceTitle}", предоставляемая специалистом ${providerName}, изменила статус на: "${this.statusMap[newStatus]}".`;

        try {
            await this.transporter.sendMail({
                from: `Платформа бронирования услуг`,
                to,
                subject,
                text,
            });
            this.logger.log(`Письмо о статусе бронирования услуги "${serviceTitle}" отправлено на ${to}`);
        } catch (error) {
            this.logger.error('Ошибка при отправке письма:', error);
        }
    }
}
