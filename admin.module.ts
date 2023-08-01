import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from './admin.entity';
import { ManagerEntity } from '../Manager/Manager.dto';
import { UserEntity } from 'src/User/User.dto';
import { MailerModule } from '@nestjs-modules/mailer';
import { NoticeEntity } from './noticeBoard.entity';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'istiaquehossain382@gmail.com',
          pass: 'xryegkgrtptxjzvf',
        },
      },
    }),
    TypeOrmModule.forFeature([
      AdminEntity,
      ManagerEntity,
      UserEntity,
      NoticeEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, MailerService],
})
export class AdminModule {}
