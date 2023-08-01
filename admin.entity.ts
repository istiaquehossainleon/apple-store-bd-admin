import { IsString, Matches, IsEmail, IsEmpty } from 'class-validator';
import { Column, PrimaryGeneratedColumn, OneToMany, Entity } from 'typeorm';
import { ManagerEntity } from '../Manager/Manager.dto';
import { UserEntity } from 'src/User/User.dto';
import { NoticeEntity } from './noticeBoard.entity';

@Entity('Admin')
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ name: 'fullname', type: 'varchar', length: 150, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;
  @Column({ nullable: true })
  phone: number;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true })
  filenames: string;

  @OneToMany(() => ManagerEntity, (manager) => manager.admin)
  manager: ManagerEntity[];

  @OneToMany(() => UserEntity, (user) => user.admin)
  user: UserEntity[];

  @OneToMany(() => NoticeEntity, (notice) => notice.admin)
  notice: NoticeEntity[];
}
