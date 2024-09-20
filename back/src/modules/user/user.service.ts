import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto} from "src/dto/createUserDto";
import { User } from "src/entities/user.entity";
import { In, Repository } from "typeorm";
import * as bcrypt from "bcrypt"
import { Role } from "src/entities/roles.entity";
import * as XLSX from 'xlsx';
import * as fs from 'fs';




@Injectable()
export class UserService{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(Role) 
    private roleRepository: Repository<Role>
    
  ) {}

  

  async getUsers():Promise<User[]> {
    try {
      
      return await this.userRepository.find({relations: ['roles']})
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users')
    }

  }

  async deteleUserById(id: string):Promise <string> {
    try {
      const userToRemove = await this.userRepository.findOneBy({id})
    if(userToRemove){
      await this.userRepository.remove(userToRemove)
      return `User with id: ${id} successfully deleted`
    }else{
      throw new NotFoundException(`User with id: ${id} not found`)
    }
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user')
    }
    
  }


  async updateUserById(id: string, createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const userToUpdate = await this.userRepository.findOne({ where: { id } })
      if (!userToUpdate) {
        throw new NotFoundException(`User with id: ${id} not found`)
      }
  
      if (!createUserDto.password) {
        throw new BadRequestException('Password is required for updating user')
      }
  
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
  
      let roles
      if (Array.isArray(createUserDto.roles)) {
        roles = createUserDto.roles.map(role => {
          if (typeof role === 'number') {
            return { id: role }  
          }
          return role
        });
      }
  
      const updatedUser = await this.userRepository.save({
        ...userToUpdate,
        ...createUserDto,
        password: hashedPassword,
        roles,  
      });
  
      const { password, ...userToShow } = updatedUser
      return userToShow
    } catch (error) {
      throw new InternalServerErrorException('Error updating user')
    }
  }
  


  
  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { candidate: true },
      })

      if (!user) {
        throw new NotFoundException(`User with id: ${id} not found`)
      }

      const { password, ...userToShow } = user
      return userToShow
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving user')
    }
  }
 
  async findUserByEmail(email:string):Promise<User>{
    try {
      const user = await this.userRepository.findOneBy({ email })
      if (!user) {
        throw new NotFoundException(`User with email: ${email} not found`)
      }
      return user
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving user by email')
    }
  }

  async findUserByDni(dni:number):Promise<User>{   
    return await this.userRepository.findOneBy({dni})
  }

  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Buscar el rol por defecto 'voter' (ID 3)
    const defaultRole = await this.roleRepository.findOne({ where: { id: 3 } });
    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    // Si se pasa un rol en el DTO, buscar ese rol, de lo contrario usar el rol por defecto
    let userRoles: Role[] = [defaultRole];
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      userRoles = await this.roleRepository.findBy({id:In(createUserDto.roles)});
      if (userRoles.length !== createUserDto.roles.length) {
        throw new BadRequestException('Some roles not found');}
    }

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: userRoles,  // Asignamos los roles aquí
    });

    await this.userRepository.save(newUser);

    // Excluir el campo `password` antes de retornar
    const { password, ...result } = newUser;
    return result;

  }

  async readExcelFile(filePath: string): Promise<CreateUserDto[]> {
    const data = fs.readFileSync(filePath);
    const workbook = XLSX.read(data, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const users: CreateUserDto[] = [];
  
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<CreateUserDto>(worksheet);
      users.push(...jsonData);
    });
  
    return users;
  }
  
  async importUsers(filePath: string): Promise<void> {
    const users = await this.readExcelFile(filePath);
    for (const user of users) {
        const existingUser = await this.findUserByEmailxlsx(user.email);
        if (!existingUser) {
            await this.createUser(user);
            console.log(`User ${user.email} added successfully.`);
        } else {
            console.log(`User ${user.email} already exists. Skipping...`);
        }
    }
}


  async findUserByEmailxlsx(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

}
