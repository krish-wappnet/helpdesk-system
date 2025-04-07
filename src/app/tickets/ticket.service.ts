import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, onSnapshot } from '@angular/fire/firestore';
import { Ticket } from '../store/state/app.state';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { cloudinaryConfig } from '../../config/env';
import { firebaseConfig } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
  private searchUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/searchTickets`;

  constructor(
    private firestore: Firestore,
    private http: HttpClient
  ) {}

  async createTicket(ticket: Partial<Ticket>, files: File[]): Promise<string[]> {
    const ticketData: Partial<Ticket> = {
      title: ticket.title || '',
      description: ticket.description || '',
      status: 'open',
      imageUrls: [],
      createdBy: ticket.createdBy || '',
      createdAt: new Date(),
      responses: [] // Initialize responses array
    };
  
    if (ticket.assignedTo) {
      ticketData.assignedTo = ticket.assignedTo;
    }
  
    if (files.length > 0) {
      const uploadPromises = files.map(file => this.uploadToCloudinary(file));
      ticketData.imageUrls = await Promise.all(uploadPromises);
    }
  
    const ticketRef = await addDoc(collection(this.firestore, 'tickets'), ticketData);
    // No need to set ticketData.id here; Firestore uses the document ID
    return ticketData.imageUrls || [];
  }

  private uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    return this.http.post<{ url: string }>(this.cloudinaryUrl, formData)
      .toPromise()
      .then(response => {
        if (!response || !response.url) {
          throw new Error('Failed to upload file to Cloudinary: No URL returned');
        }
        return response.url;
      })
      .catch(error => {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
      });
  }

  getTicketsByUser(userId: string): Observable<Ticket[]> {
    const ticketsQuery = query(
      collection(this.firestore, 'tickets'),
      where('createdBy', '==', userId)
    );
    return from(getDocs(ticketsQuery)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket)))
    );
  }

  getTicketsByAgent(agentId: string): Observable<Ticket[]> {
    return new Observable(observer => {
      const ticketsCollection = collection(this.firestore, 'tickets');
      const q = query(ticketsCollection, where('assignedTo', '==', agentId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tickets: Ticket[] = snapshot.docs.map(doc => {
          const ticketData = doc.data();
          const ticket: Ticket = {
            id: doc.id, // Firestore document ID takes priority
            title: ticketData['title'] || '',
            description: ticketData['description'] || '',
            status: ticketData['status'] || 'open',
            createdBy: ticketData['createdBy'] || '',
            assignedTo: ticketData['assignedTo'] || undefined,
            createdAt: ticketData['createdAt']?.toDate() || new Date(),
            imageUrls: ticketData['imageUrls'] || [],
            responses: ticketData['responses'] || [],
          };
          console.log('Mapped ticket in getTicketsByAgent:', ticket); // Debug log
          return ticket;
        });
        observer.next(tickets);
      }, (error) => {
        observer.error(error);
      });
      return () => unsubscribe();
    });
  }

  searchTickets(query: string, userId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.searchUrl, {
      params: { q: query, userId },
    });
  }
}