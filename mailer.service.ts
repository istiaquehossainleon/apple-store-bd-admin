import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'istiaquehossain382@gmail.com',
        pass: 'xryegkgrtptxjzvf',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'istiaquehossain382@gmail.com',
      to,
      subject,
      text,
    };
    console.log(to);

    await this.transporter.sendMail(mailOptions);
  }
}
