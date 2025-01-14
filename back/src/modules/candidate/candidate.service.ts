import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../entities/candidate.entity';
import { CreateCandidateDto } from '../../dto/createCandidate.dto';
import { User } from '../../entities/user.entity';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Role } from 'src/entities/roles.entity';
import { Campaign } from 'src/entities/campaign.entity';


@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async create(
    createCandidateDto: CreateCandidateDto,
    file: Express.Multer.File,
  ): Promise<Candidate> {
    const { userId, campaignId, ...candidateData } = createCandidateDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    const existingCandidate = await this.candidateRepository.findOne({
      where: {
        user: { id: userId },
        campaign: { id: campaignId },
      },
    });
  
    if (existingCandidate) {
      throw new ConflictException('Este candidato ya ha sido nombrado para esta campaña');
    }

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!Array.isArray(user.roles)) {
      user.roles = [];
    }

    const candidateRole = await this.roleRepository.findOne({
      where: { name: 'candidate' },
    });
    if (!candidateRole) {
      throw new NotFoundException('Rol "Candidato" no encontrado');
    }

    const hasCandidateRole = user.roles.some(
      (role) => role.name === 'candidate',
    );

    if (!hasCandidateRole) {
      user.roles.push(candidateRole);
      await this.userRepository.save(user);
    }

    const proposalString = JSON.stringify(createCandidateDto.proposals);
    let imageUrl: string | undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(
        file.buffer,
        file.originalname,
      );
      imageUrl = uploadResult; 
    }

    const candidate = this.candidateRepository.create({
      ...candidateData,
      proposals: proposalString,
      imgUrl: imageUrl, 
      user,
      campaign,
    });
    return this.candidateRepository.save(candidate);
  }

  findAll(): Promise<Candidate[]> {
    return this.candidateRepository
      .find({ relations: ['user', 'votes'] })
      .then((candidates) => {
        return candidates.map((candidate) => {
          return {
            ...candidate,
            proposals: JSON.parse(candidate.proposals), 
          };
        });
      });
  }

  findOne(id: string): Promise<Candidate> {
    return this.candidateRepository
      .findOne({
        where: { id },
        relations: ['user', 'votes'],
      })
      .then((candidate) => {
        if (candidate) {
          return {
            ...candidate,
            proposals: JSON.parse(candidate.proposals), 
          };
        }
        return null;
      });
  }

  async updateCandidate(
    id: string,
    updateData: Partial<Candidate>,
    file?: Express.Multer.File, // Add optional file parameter
  ): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });
  
    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }
  
    // Convert proposals to JSON string if provided
    if (updateData.proposals) {
      updateData.proposals = JSON.stringify(updateData.proposals);
    }
  
    // Handle the image upload if a file is provided
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(
        file.buffer,
        file.originalname
      );
      updateData.imgUrl = uploadResult; // Store the Cloudinary URL in updateData
    }
  
    // Save the updated candidate
    const updatedCandidate = await this.candidateRepository.save({
      ...candidate,
      ...updateData,
    });
  
    return {
      ...updatedCandidate,
      proposals: JSON.parse(updatedCandidate.proposals),
    };
  }

  async deleteCandidate(id: string): Promise<void> {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['user', 'user.roles'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
    }

    const candidateRole = await this.roleRepository.findOneBy({ id: 2 });
    const voterRole = await this.roleRepository.findOneBy({ id: 1 });

    if (!candidateRole || !voterRole) {
      throw new NotFoundException('Rol no encontrado');
    }

    const user = candidate.user;
    user.roles = user.roles.filter((role) => role.id !== candidateRole.id);
    const hasVoterRole = user.roles.some((role) => role.id === voterRole.id);

    if (!hasVoterRole) {
      user.roles.push(voterRole);
    }
    await this.userRepository.save(user);
    await this.candidateRepository.remove(candidate);
  }
}
