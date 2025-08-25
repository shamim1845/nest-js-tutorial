import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  public getProfiles() {
    return this.profileService.getProfiles();
  }

  @Delete(':id')
  public deleteProfile(@Param('id') id: number) {
    return this.profileService.deleteProfile(id);
  }
}
