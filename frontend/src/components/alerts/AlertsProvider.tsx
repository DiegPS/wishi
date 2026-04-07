import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
    id: number;
    type: AlertType;
    title: string;
    message: string;
}

interface NotifyOptions {
    type?: AlertType;
    title: string;
    message: string;
    durationMs?: number;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface ConfirmDialogState extends ConfirmOptions {
    open: boolean;
}

interface AlertsContextValue {
    notify: (options: NotifyOptions) => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [dialog, setDialog] = useState<ConfirmDialogState | null>(null);

    const nextIdRef = useRef(1);
    const timeoutIdsRef = useRef<number[]>([]);
    const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

    const dismissToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const notify = useCallback((options: NotifyOptions) => {
        const id = nextIdRef.current++;
        const toast: Toast = {
            id,
            type: options.type || 'info',
            title: options.title,
            message: options.message,
        };

        setToasts((current) => [...current, toast]);

        const defaultDuration = (options.type === 'error' || options.type === 'warning') ? 8000 : 3500;
        const duration = options.durationMs ?? defaultDuration;
        const timeoutId = window.setTimeout(() => {
            dismissToast(id);
        }, duration);

        timeoutIdsRef.current.push(timeoutId);
    }, [dismissToast]);

    const closeConfirm = useCallback((value: boolean) => {
        if (confirmResolverRef.current) {
            confirmResolverRef.current(value);
            confirmResolverRef.current = null;
        }
        setDialog(null);
    }, []);

    const confirm = useCallback((options: ConfirmOptions) => {
        if (confirmResolverRef.current) {
            confirmResolverRef.current(false);
            confirmResolverRef.current = null;
        }

        setDialog({ ...options, open: true });

        return new Promise<boolean>((resolve) => {
            confirmResolverRef.current = resolve;
        });
    }, []);

    useEffect(() => {
        return () => {
            for (const timeoutId of timeoutIdsRef.current) {
                window.clearTimeout(timeoutId);
            }

            if (confirmResolverRef.current) {
                confirmResolverRef.current(false);
                confirmResolverRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!dialog?.open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeConfirm(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [dialog, closeConfirm]);

    return (
        <AlertsContext.Provider value={{ notify, confirm }}>
            {children}

            <div className="app-alerts-region" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`app-toast app-toast-${toast.type}`} role="status">
                        <div className="app-toast-content">
                            <strong className="app-toast-title">{toast.title}</strong>
                            <span className="app-toast-message">{toast.message}</span>
                        </div>
                        <button
                            className="app-toast-close"
                            onClick={() => dismissToast(toast.id)}
                            aria-label="Dismiss notification"
                            title="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {dialog?.open && (
                <div className="app-confirm-backdrop" role="presentation">
                    <div className="app-confirm-dialog glass-panel" role="dialog" aria-modal="true" aria-labelledby="app-confirm-title">
                        <h3 id="app-confirm-title" className="app-confirm-title">{dialog.title}</h3>
                        <p className="app-confirm-message">{dialog.message}</p>
                        <div className="app-confirm-actions">
                            <button className="button-secondary" onClick={() => closeConfirm(false)}>
                                {dialog.cancelText || 'Cancel'}
                            </button>
                            <button
                                className={dialog.danger ? 'button-danger' : 'button-primary'}
                                onClick={() => closeConfirm(true)}
                            >
                                {dialog.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AlertsContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error('useAlerts must be used within AlertsProvider');
    }
    return context;
}
