import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/toast.service';
import { BehaviorSubject } from 'rxjs';

describe('ToastComponent', () => {
    let component: ToastComponent;
    let toastService: ToastService;

    beforeEach(() => {
        toastService = new ToastService();
        component = new ToastComponent(toastService);
    });

    it('should subscribe to toasts on init', () => {
        component.ngOnInit();
        expect(component.toasts).toEqual([]);
    });

    it('should display toasts when service emits', () => {
        component.ngOnInit();
        toastService.success('Test', 'Message');
        expect(component.toasts.length).toBe(1);
        expect(component.toasts[0].title).toBe('Test');
    });

    it('should dismiss a toast', () => {
        component.ngOnInit();
        toastService.success('Test', 'Message', 0);
        const id = component.toasts[0].id;
        component.dismiss(id);
        expect(component.toasts.length).toBe(0);
    });

    it('should unsubscribe on destroy', () => {
        component.ngOnInit();
        component.ngOnDestroy();
        toastService.success('Test', 'Should not appear');
        expect(component.toasts.length).toBe(0);
    });
});
