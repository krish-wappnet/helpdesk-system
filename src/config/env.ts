import { environment } from '../app/environment/clodinary';

export const cloudinaryConfig = {
  cloudName: environment.cloudinary.cloudName,
  uploadPreset: environment.cloudinary.uploadPreset
};