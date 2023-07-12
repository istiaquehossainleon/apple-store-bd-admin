import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AddAdminDTO, AdminLoginDTO, SalaryDTO } from './admin.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { AdminEntity } from './admin.entity';
import { DoctorEntity } from '../Doctor/doctor.dto';
import { PatientEntity } from 'src/Patient/Patient.dto';
import { MailerService } from '@nestjs-modules/mailer/dist';
import * as bcrypt from 'bcrypt';
import { EmailDTO } from './email.dto';
import { NoticeEntity } from './noticeBoard.entity';
import { AppointmentEntity } from 'src/Doctor/appointment.entitiy';
import { SalaryEntity } from './salary.entity';

@Injectable()
export class AdminService {
  signupp(mydata: AddAdminDTO) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(AdminEntity)
    private AdminRepo: Repository<AdminEntity>,
    @InjectRepository(DoctorEntity)
    private doctorRepo: Repository<DoctorEntity>,
    @InjectRepository(PatientEntity)
    private patientRepo: Repository<PatientEntity>,
    @InjectRepository(AppointmentEntity)
     private appointmentRepo: Repository<AppointmentEntity>,
    @InjectRepository(NoticeEntity)
    private noticeRepo: Repository<NoticeEntity>,
    @InjectRepository(SalaryEntity)
    private salaryRepo: Repository<SalaryEntity>,

    private mailerService: MailerService
  ) {}

  async addAdmin(data: AddAdminDTO): Promise<AdminEntity> {
    console.log("Account Created Successfully");
    return this.AdminRepo.save(data);
  }

  async ViewProfile(id: number): Promise<AdminEntity[]> {
    return this.AdminRepo.find({
      select: {
        name: true,
        email: true,
        id: true,
        password: true,
        filenames: true
      },
      where: {
        id: id,
      }
    });
  }

  async signup(data: AddAdminDTO): Promise<AdminEntity> {
    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password,salt);
   return this.AdminRepo.save(data);
}
  

async signIn(data: AdminLoginDTO) {
  const userdata= await this.AdminRepo.findOneBy({email:data.email});
const match:boolean = await bcrypt.compare(data.password, userdata.password);
return match;
}

async getimagebyadminid(adminid:number) {
  const mydata:AddAdminDTO =await this.AdminRepo.findOneBy({ id:adminid});
  console.log(mydata);
  return  mydata.filenames;
      }

//Dashboard
getDashboard():any {
  return "Admin Dashboard";
}

//Email 
// async mailPatient(mail: PmailEntity, subject: string, text: string): Promise<PmailEntity> {
//   return this.pmailRepo.save({
//     email: mail.email,
//     subject,
//     message: mail.message,
//   });
// }

// async mailPatient(pmail: any): Promise<PmailEntity> {
//   return this.pmailRepo.save(pmail);
// }

async emailSending(clientdata: { email: any; subject: any; text: any; }) {
  return await this.mailerService.sendMail({
    to: clientdata.email,
    subject: clientdata.subject,
    text: clientdata.text,
  });
}
//Notice Board

async addNotice(notice: any): Promise<NoticeEntity> {
  return this.noticeRepo.save(notice);
}

// async getAllNotice(): Promise<NoticeEntity[]> {
//   return this.noticeRepo.find({ select: ['subject', 'message', 'postedTime', 'sl', 'admin'] });
// }

async getAllNotice(): Promise<NoticeEntity[]> {
  const notices = await this.noticeRepo.find({
    select: ['sl', 'subject', 'message', 'postedTime'],
    relations: ['admin'],
  });
  const mm: NoticeEntity[] = notices.map(notice => {
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








//Doctor section
  async addDoctor(doctor: any): Promise<DoctorEntity> {
    return this.doctorRepo.save(doctor);
  }

  async getAllDoctor(): Promise<DoctorEntity[]> {
    return this.doctorRepo.find({ select: ['id', 'name', 'email'] });
}

async getDoctorById(id: number): Promise<DoctorEntity> {
  return this.doctorRepo.findOne({ where: { id },
    select: ['id', 'name', 'email'], });
}

async viewDoctorsByAdmin(id: any): Promise<AdminEntity[]> {
  return this.AdminRepo.createQueryBuilder('admin')
    .leftJoinAndSelect('admin.doctor', 'doctor')
    .select(['admin.id', 'admin.name', 'admin.email'])
    .addSelect(['doctor.id', 'doctor.name', 'doctor.email'])
    .where('admin.id = :id', { id })
    .getMany();
}

  async deleteAllDoctors(): Promise<{ message: string }> {
    const deleteResult = await this.doctorRepo.delete({});
    
    if (deleteResult.affected > 0) {
      return { message: 'All doctors removed successfully' };
    } else {
      return { message: 'No doctors to remove' };
    }
  }
  
  
  async deleteOneDoctor(Id: number): Promise<{ message: string }> {
    const doctor = await this.doctorRepo.findOne({
      where: { id: Id },
    });
    
    if (!doctor) {
      throw new NotFoundException('doctor not found');
    }
  
    await this.doctorRepo.remove(doctor);
    return { message: 'Doctor removed successfully' };
  }

  async updateDoctorById(id: number, data: Partial<DoctorEntity>, name: string): Promise<{ message: string; updatedDoctor: DoctorEntity }> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
  
    const updatedDoctor = Object.assign(doctor, data);
    const savedDoctor = await this.patientRepo.save(updatedDoctor);
    
    return { message: `Doctor named ${name} of ID number ${id} updated successfully`, updatedDoctor: savedDoctor };
  }



  //Patient Section
  async addPatient(patient: any): Promise<PatientEntity> {
    return this.patientRepo.save(patient);
  }

  async getAllPatient(): Promise<PatientEntity[]> {
    return this.patientRepo.find({ select: ['id', 'name', 'email', 'diagonized'] });
}

async getPatientById(id: number): Promise<PatientEntity> {
  return this.patientRepo.findOne({ 
    where: { id },
    select: ['id', 'name', 'email', 'diagonized'],
  });
}




  
async viewPatientsByAdmin(id: any): Promise<AdminEntity[]> {
  return this.AdminRepo.createQueryBuilder('admin')
    .leftJoinAndSelect('admin.patient', 'patient')
    .select(['admin.id', 'admin.name', 'admin.email'])
    .addSelect(['patient.id', 'patient.name', 'patient.email', 'patient.diagonized'])
    .where('admin.id = :id', { id })
    .getMany();
}


  async deleteAllPatients(): Promise<{ message: string }> {
    const deleteResult = await this.patientRepo.delete({});
    
    if (deleteResult.affected > 0) {
      return { message: 'All patients deleted successfully' };
    } else {
      return { message: 'No patients found' };
    }
  }
  
  
  async deleteOnePatient(Id: number): Promise<{ message: string }> {
    const patient = await this.patientRepo.findOne({
      where: { id: Id },
    });
    
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
  
    await this.patientRepo.remove(patient);
    return { message: 'Patient deleted successfully' };
  }

  async updatePatientById(id: number, data: Partial<PatientEntity>, name: string): Promise<{ message: string; updatedPatient: PatientEntity }> {
    const patient = await this.patientRepo.findOne({ where: { id } });
    
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
  
    const updatedPatient = Object.assign(patient, data);
    const savedPatient = await this.patientRepo.save(updatedPatient);
    
    return { message: `Patient named ${name} of ID number ${id} updated successfully`, updatedPatient: savedPatient };
  }

  // Appointment

  async viewallAppoinment(): Promise<AppointmentEntity[]> {
    const app = await this.appointmentRepo.find({
      select: ['Serial', 'name', 'age', 'date', 'time'],
      relations: ['doctor'],
    });
    const rel: AppointmentEntity[] = app.map(appo => {
      const rel = { ...appo };
      if (rel.doctor) {
        rel.name = `Added by doctor ${rel.doctor.name}: ${rel.name}`;
        delete rel.doctor.password;
        delete rel.doctor.email;
      }
      return rel;
    });
  
    return rel;
  }


  async deleteAllAppointment(): Promise<{ message: string }> {
    const deleteResult = await this.doctorRepo.delete({});
    
    if (deleteResult.affected > 0) {
      return { message: 'All appointment removed successfully' };
    } else {
      return { message: 'No appointment to remove' };
    }
  }
  
  
  async deleteAppointment(Serial: number): Promise<{ message: string }> {
    const app = await this.appointmentRepo.findOne({
      where: { Serial: Serial },
    });
    
    if (!app) {
      throw new NotFoundException('Appointment not found');
    }
  
    await this.appointmentRepo.remove(app);
    return { message: `Appointment Serial ${Serial} removed successfully`};
  }


  //Salary
  async addSalary(salary: SalaryEntity): Promise<SalaryEntity> {
    try {
      return this.salaryRepo.save(salary);
    } catch (error) {
      throw new InternalServerErrorException('Failed to add salary');
    }
  }


  async getAllDoctorSalary(): Promise<SalaryEntity[]> {
    const salaries = await this.salaryRepo.find({
      relations: ['doctor'],
    });
  
    const modifiedSalaries: SalaryEntity[] = salaries.map(salary => {
      if (salary.doctor) {
        salary.salary = ` Doctor ${salary.doctor.name} gets: ${salary.salary} Taka per Month`;
        delete salary.doctor.password;
        delete salary.doctor.email;
      }
      return salary;
    });
  
    return modifiedSalaries;
  }

  async deleteAllSalary(): Promise<{ message: string }> {
    const deleteSal = await this.salaryRepo.delete({});
    
    if (deleteSal.affected > 0) {
      return { message: 'All salaries cutted successfully' };
    } else {
      return { message: 'No Salaries to remove' };
    }
  }
//Eid Bonus

  async updateEidSalary(): Promise<SalaryEntity[]> {
  const salaries = await this.salaryRepo.find();

  const updatedSalaries: SalaryEntity[] = [];
  for (const salary of salaries) {
    const currentSalary = Number(salary.salary);
    const updatedSalaryValue = (currentSalary + 120).toString();
    salary.salary = updatedSalaryValue;

    const updatedSalary = await this.salaryRepo.save(salary);
    updatedSalaries.push(updatedSalary);
  }

  return updatedSalaries;
}

async updateSalarybycode(code: number, data: Partial<SalaryEntity>, name: string): Promise<{ message: string; updatedSalary: SalaryEntity }> {
  const salary = await this.salaryRepo.findOne({ where: { code } });
  
  if (!salary) {
    throw new NotFoundException('Patient not found');
  }

  const updatedSalary = Object.assign(salary, data);
  const savedSalary = await this.salaryRepo.save(updatedSalary);
  
  return { message: `Doctor salary of code ${code} updated successfully`, updatedSalary: savedSalary };
}





  
  
  
}