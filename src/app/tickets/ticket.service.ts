import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { cloudinaryConfig } from '../../config/env';
import { Ticket } from '../store/state/app.state';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly cloudinaryUrl: string;
  private readonly uploadPreset: string;

  constructor(
    private firestore: Firestore,
    private http: HttpClient
  ) {
    this.cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
    this.uploadPreset = cloudinaryConfig.uploadPreset;
    console.log('Cloudinary Cloud Name:', this.cloudinaryUrl);
    console.log('Cloudinary Upload Preset:', this.uploadPreset);
    if (!this.uploadPreset) {
      console.error('ERROR: Cloudinary upload preset is undefined');
    }
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const response = await firstValueFrom(this.http.post<any>(this.cloudinaryUrl, formData));
      return response.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  async createTicket(ticket: Partial<Ticket>, files: File[]): Promise<void> {
    try {
      const imageUrls = await Promise.all(files.map(file => this.uploadImage(file)));
      const ticketData: Ticket = {
        ...ticket,
        imageUrls,
        createdAt: new Date(),
        status: 'open'
      } as Ticket;
      const ticketsCollection = collection(this.firestore, 'tickets');
      await addDoc(ticketsCollection, ticketData);
    } catch (error) {
      console.error('Ticket creation failed:', error);
      throw error;
    }
  }

  getTickets(): Observable<Ticket[]> {
    const ticketsCollection = collection(this.firestore, 'tickets');
    return collectionData(ticketsCollection, { idField: 'id' }) as Observable<Ticket[]>;
  }
}