import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PhotoProof } from '../PhotoProof';

describe('PhotoProof', () => {
  it('shows "Add photo" button when no photos exist', () => {
    render(<PhotoProof photos={[]} onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add proof photo/i })).toBeInTheDocument();
  });

  it('shows "Add another" button when photos already exist', () => {
    render(<PhotoProof photos={['data:image/png;base64,abc']} onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add another proof photo/i })).toBeInTheDocument();
  });

  it('renders existing photos as images', () => {
    render(<PhotoProof photos={['data:image/png;base64,abc', 'data:image/png;base64,def']} onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/2 proof photos/i)).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('renders nothing when disabled with no photos', () => {
    const { container } = render(<PhotoProof photos={[]} onAdd={vi.fn()} disabled />);
    expect(container.firstChild).toBeNull();
  });

  it('shows existing photos even when disabled', () => {
    render(<PhotoProof photos={['data:image/png;base64,abc']} onAdd={vi.fn()} disabled />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onAdd with a data URL when a file is selected', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<PhotoProof photos={[]} onAdd={onAdd} />);

    const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' });

    // FileReader isn't available in jsdom; we stub it.
    const readAsDataURLSpy = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (
      this: FileReader,
    ) {
      Object.defineProperty(this, 'result', { value: 'data:image/jpeg;base64,fake' });
      this.onload?.({ target: this } as ProgressEvent<FileReader>);
    });

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file);

    expect(onAdd).toHaveBeenCalledWith('data:image/jpeg;base64,fake');
    readAsDataURLSpy.mockRestore();
  });
});
