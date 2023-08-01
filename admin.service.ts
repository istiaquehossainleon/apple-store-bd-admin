import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Session,
} from '@nestjs/common';
import { AddAdminDTO, AdminLoginDTO } from './admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEntity } from './admin.entity';
import { ManagerEntity } from '../Manager/Manager.dto';
import { UserEntity } from 'src/User/User.dto';
import * as bcrypt from 'bcrypt';
import { NoticeEntity } from './noticeBoard.entity';
import { MailerService } from './mailer.service';

@Injectable()
export class AdminService {
  signupp(mydata: AddAdminDTO) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(AdminEntity)
    private AdminRepo: Repository<AdminEntity>,
    @InjectRepository(ManagerEntity)
    private managerRepo: Repository<ManagerEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @InjectRepository(NoticeEntity)
    private noticeRepo: Repository<NoticeEntity>,
    private mailerService: MailerService,
  ) {}

  async ViewProfile(id: number): Promise<AdminEntity[]> {
    return this.AdminRepo.find({
      select: {
        name: true,
        email: true,
        id: true,
        password: false,
        filenames: false,
      },
      where: {
        id: id,
      },
    });
  }

  async signup(data: AddAdminDTO): Promise<AdminEntity> {
    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password, salt);
    return this.AdminRepo.save(data);
  }

  async getimagebyadminid(adminid: number) {
    const mydata: AddAdminDTO = await this.AdminRepo.findOneBy({ id: adminid });
    console.log(mydata);
    return mydata.filenames;
  }

  //Dashboard
  getDashboard(): any {
    return 'Admin Dashboard';
  }

  //Email
  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    await this.mailerService.sendMail(to, subject, text);
  }

  //Notice Board

  async addNotice(notice: any): Promise<NoticeEntity> {
    return this.noticeRepo.save(notice);
  }

  async getAllNotice(): Promise<NoticeEntity[]> {
    const notices = await this.noticeRepo.find({
      select: ['sl', 'subject', 'message', 'postedTime'],
      relations: ['admin'],
    });
    const mm: NoticeEntity[] = notices.map((notice) => {
      const mm = { ...notice };
      if (mm.admin) {
        mm.message = `Posted by ${mm.admin.name}: ${mm.message}`;
        delete mm.admin.password;
        delete mm.admin.email;
      }
      return mm;
    });

    return mm;
  }

  async deleteAllNotice(): Promise<{ message: string }> {
    const deleteResult = await this.noticeRepo.delete({});

    if (deleteResult.affected > 0) {
      return { message: 'All notices removed successfully' };
    } else {
      return { message: 'No notice to remove' };
    }
  }

  async deleteOneNotice(SL: number): Promise<{ message: string }> {
    const notice = await this.noticeRepo.findOne({
      where: { sl: SL },
    });

    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    await this.noticeRepo.remove(notice);
    return { message: 'Notice removed successfully' };
  }

  //Manager section
  async addManager(manager: any): Promise<ManagerEntity> {
    return this.managerRepo.save(manager);
  }

  async getAllManager(): Promise<ManagerEntity[]> {
    return this.managerRepo.find({ select: ['id', 'name', 'email'] });
  }

  async getManagerById(id: number): Promise<ManagerEntity> {
    return this.managerRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email'],
    });
  }

  async viewManagersByAdmin(id: any): Promise<AdminEntity[]> {
    return this.AdminRepo.createQueryBuilder('admin')
      .leftJoinAndSelect('admin.manager', 'manager')
      .select(['admin.id', 'admin.name', 'admin.email'])
      .addSelect(['manager.id', 'manager.name', 'manager.email'])
      .where('admin.id = :id', { id })
      .getMany();
  }

  async deleteOneManager(Id: number): Promise<{ message: string }> {
    const manager = await this.managerRepo.findOne({
      where: { id: Id },
    });

    if (!manager) {
      throw new NotFoundException('manager not found');
    }

    await this.managerRepo.remove(manager);
    return { message: 'Manager removed successfully' };
  }

  async updateManagerById(
    id: number,
    data: Partial<ManagerEntity>,
    name: string,
  ): Promise<{ message: string; updatedManager: ManagerEntity }> {
    const manager = await this.managerRepo.findOne({ where: { id } });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    const updatedManager = Object.assign(manager, data);
    const savedManager = await this.managerRepo.save(updatedManager);

    return {
      message: `Manager named ${name} of ID number ${id} updated successfully`,
      updatedManager: savedManager,
    };
  }

  //User Section
  async addUser(user: any): Promise<UserEntity> {
    return this.userRepo.save(user);
  }

  async getAllUser(): Promise<UserEntity[]> {
    return this.userRepo.find({
      select: ['id', 'name', 'email'],
    });
  }

  async getUserById(id: number): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email'],
    });
  }

  async viewUsersByAdmin(id: any): Promise<AdminEntity[]> {
    return this.AdminRepo.createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user')
      .select(['admin.id', 'admin.name', 'admin.email'])
      .addSelect(['user.id', 'user.name', 'user.email'])
      .where('admin.id = :id', { id })
      .getMany();
  }

  async deleteAllUsers(): Promise<{ message: string }> {
    const deleteResult = await this.userRepo.delete({});

    if (deleteResult.affected > 0) {
      return { message: 'All users deleted successfully' };
    } else {
      return { message: 'No users found' };
    }
  }

  async deleteOneUser(Id: number): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { id: Id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.remove(user);
    return { message: 'User deleted successfully' };
  }

  async updateUserById(
    id: number,
    data: Partial<UserEntity>,
    name: string,
  ): Promise<{ message: string; updatedUser: UserEntity }> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = Object.assign(user, data);
    const savedUser = await this.userRepo.save(updatedUser);

    return {
      message: `User named ${name} of ID number ${id} updated successfully`,
      updatedUser: savedUser,
    };
  }
}
