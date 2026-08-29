import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Guardar</Button>);
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    });

    it('applies the destructive variant class', () => {
        render(<Button variant="destructive">Eliminar</Button>);
        const button = screen.getByRole('button', { name: 'Eliminar' });
        expect(button.className).toContain('bg-destructive');
    });
});
