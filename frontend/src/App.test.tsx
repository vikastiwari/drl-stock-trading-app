import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    // Basic mount test to ensure the tree compiles
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('renders the GlobalModal', () => {
    render(<App />);
    // Testing logic to see if UI structure exists
    const container = screen.getByText(/Settings/i);
    // Note: Due to dynamic imports and canvas rendering, 
    // full component tests require more extensive mocks.
    // This serves as the foundation.
    expect(container).toBeInTheDocument();
  });
});
