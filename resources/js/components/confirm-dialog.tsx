import { LoaderCircle } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    busy?: boolean;
    trigger: React.ReactNode;
}

export function ConfirmDialog({
    title = '¿Estás seguro?',
    description = 'Esta acción no se puede deshacer.',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    busy = false,
    trigger,
}: ConfirmDialogProps) {
    const [open, setOpen] = React.useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={busy}>
                            {cancelLabel}
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={busy}
                    >
                        {busy && (
                            <LoaderCircle className="size-4 animate-spin" />
                        )}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
