import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
    toasts: ToastMessage[] = [];
    private subscription = new Subscription();

    constructor(
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.subscription.add(
            this.toastService.getToasts().subscribe(toasts => {
                this.toasts = toasts;
                this.cdr.detectChanges();
            })
        );
    }

    dismiss(id: number): void {
        this.toastService.dismiss(id);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
