import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Session,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
  BadRequestException,
  ParseFloatPipe,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AddAdminDTO } from './admin.dto';
import { AddManagerDTO, ManagerEntity } from '../Manager/Manager.dto';
import { AdminEntity } from './admin.entity';
import { UserEntity } from 'src/User/User.dto';
import { MulterError, diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { NoticeEntity } from './noticeBoard.entity';
import * as bcrypt from 'bcrypt';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/ViewAdminProfile/:id')
  ViewProfile(@Param('id') id: number): Object {
    return this.adminService.ViewProfile(id);
  }

  @Post('/signup')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 30000 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  @UsePipes(new ValidationPipe())
  signup(
    @Body() mydata: AddAdminDTO,
    @UploadedFile() imageobj: Express.Multer.File,
  ) {
    console.log(mydata);
    console.log(imageobj.filename);
    mydata.filenames = imageobj.filename;
    return this.adminService.signup(mydata);
  }

  @Get('/showadminphotobyid/:adminId')
  async getimagebyadminid(
    @Param('adminId', ParseIntPipe) adminId: number,
    @Res() res,
  ) {
    const filename = await this.adminService.getimagebyadminid(adminId);
    res.sendFile(filename, { root: './uploads' });
  }

  //DashBoard

  @Get('/dashboard')
  getDashboard(): any {
    return this.adminService.getDashboard();
  }

  //Email

  @Post('/sendemail')
  async sendEmail(
    @Body() emailData: { to: string; subject: string; text: string },
  ): Promise<void> {
    const { to, subject, text } = emailData;
    await this.adminService.sendEmail(to, subject, text);
  }

  //Notice Board

  @Post('/addNotice')
  addNotice(@Body() notice: any): Promise<NoticeEntity> {
    console.log(notice);
    return this.adminService.addNotice(notice);
  }

  @Get('/viewallnotice')
  getAllNotice(): Promise<NoticeEntity[]> {
    return this.adminService.getAllNotice();
  }

  @Delete('/deleteallnotice')
  deleteAllNotice(): object {
    return this.adminService.deleteAllNotice();
  }

  @Delete('/deleteOneNotice/:sl')
  deleteOneNotice(
    @Param('sl', ParseIntPipe) SL: number,
  ): Promise<{ message: string }> {
    return this.adminService.deleteOneNotice(SL);
  }

  //Manager Section

  @Post('/addmanager')
  addManager(@Body() manager: any): Promise<ManagerEntity> {
    console.log(manager);
    return this.adminService.addManager(manager);
  }

  @Get('/viewallmanager')
  getAllManager(): Promise<ManagerEntity[]> {
    return this.adminService.getAllManager();
  }

  @Get('/manager/:id')
  getManagerById(@Param('id', ParseIntPipe) id: number): object {
    return this.adminService.getManagerById(id);
  }

  @Get('/adminaddedmanagers/:adminid')
  viewManagersByAdmin(
    @Param('adminid', ParseIntPipe) adminid: number,
  ): Promise<AdminEntity[]> {
    return this.adminService.viewManagersByAdmin(adminid);
  }

  @Delete('/deleteOneManager/:id')
  deleteOneManager(
    @Param('id', ParseIntPipe) Id: number,
  ): Promise<{ message: string }> {
    return this.adminService.deleteOneManager(Id);
  }

  @Put('/manager/:id')
  updateManagerById(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<ManagerEntity>,
    @Body('name') name: string,
  ): Promise<{ message: string; updatedManager: ManagerEntity }> {
    return this.adminService.updateManagerById(id, data, name);
  }

  @Post('/adduser')
  addUser(@Body() user: any): Promise<UserEntity> {
    console.log(user);
    return this.adminService.addUser(user);
  }

  @Get('/viewalluser')
  getAllUser(): Promise<UserEntity[]> {
    return this.adminService.getAllUser();
  }

  @Get('/user/:id')
  getUserById(@Param('id', ParseIntPipe) id: number): object {
    return this.adminService.getUserById(id);
  }

  @Get('/Userunderadmin/:adminid')
  viewUsersByAdmin(
    @Param('adminid', ParseIntPipe) adminid: number,
  ): Promise<AdminEntity[]> {
    return this.adminService.viewUsersByAdmin(adminid);
  }

  @Delete('/deleteusers')
  deleteAllUsers(): object {
    return this.adminService.deleteAllUsers();
  }

  @Delete('/deleteOneUser/:id')
  deleteOneUser(
    @Param('id', ParseIntPipe) Id: number,
  ): Promise<{ message: string }> {
    return this.adminService.deleteOneUser(Id);
  }

  @Put('/user/:id')
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<UserEntity>,
    @Body('name') name: string,
  ): Promise<{ message: string; updatedUser: UserEntity }> {
    return this.adminService.updateUserById(id, data, name);
  }
}
