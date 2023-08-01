import { IsString, Matches, IsEmail, IsEmpty } from 'class-validator';
import { Column, PrimaryGeneratedColumn, OneToMany, Entity } from 'typeorm';

export class AddAdminDTO {
  @IsString({ message: 'invalid name' })
  @Matches(/^[a-zA-Z]+$/, { message: 'enter a proper name' })
  name: string;

  @IsEmail({}, { message: 'invalid email' })
  email: string;

  @Matches(/^\d{8,}$/, { message: 'Password must be at least 8 digits long.' })
  password: string;
  @Matches(/^\d{11,}$/, { message: 'Must be at least 8 digits.' })
  phone: number;
  filenames: string;
}

export class AdminLoginDTO {
  @IsEmail({}, { message: 'invalid email' })
  email: string;
  password: string;
}

