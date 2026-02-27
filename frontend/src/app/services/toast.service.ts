import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: number;
    title: string;
    message: string;
    type: ToastType;
    duration: number;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts$ = new BehaviorSubject<ToastMessage[]>([]);
    private idCounter = 0;

    private readonly ICON_MAP: Record<ToastType, string> = {
        success: '\u2705',
        error: '\u274C',
        info: '\u2139\uFE0F',
        warning: '\u26A0\uFE0F'
    };

    constructor(private ngZone: NgZone) {}

    getToasts(): Observable<ToastMessage[]> {
        return this.toasts$.asObservable();
    }

    show(title: string, message: string, type: ToastType = 'info', duration: number = 5000): void {
        const toast: ToastMessage = {
            id: ++this.idCounter,
            title,
            message,
            type,
            duration,
            icon: this.ICON_MAP[type]
        };

        this.ngZone.run(() => {
            this.toasts$.next([...this.toasts$.value, toast]);
        });

        if (duration > 0) {
            setTimeout(() => this.dismiss(toast.id), duration);
        }
    }

    success(title: string, message: string, duration: number = 5000): void {
        this.show(title, message, 'success', duration);
    }

    error(title: string, message: string, duration: number = 6000): void {
        this.show(title, message, 'error', duration);
    }

    dismiss(id: number): void {
        this.ngZone.run(() => {
            this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
        });
    }
}
