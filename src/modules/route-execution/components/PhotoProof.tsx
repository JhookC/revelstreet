import { useRef, type ChangeEvent } from 'react';
import { Button } from '@heroui/react';

interface Props {
  photos: string[];
  onAdd: (dataUrl: string) => void;
  disabled?: boolean;
}

export function PhotoProof({ photos, onAdd, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAdd(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  if (photos.length === 0 && disabled) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label={`${photos.length} proof photo${photos.length > 1 ? 's' : ''}`}>
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Proof ${i + 1}`}
              className="h-14 w-14 rounded-lg object-cover border border-border"
            />
          ))}
        </div>
      )}

      {!disabled && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={handleChange}
          />
          <Button
            size="sm"
            variant="outline"
            onPress={() => inputRef.current?.click()}
            aria-label={photos.length === 0 ? 'Add proof photo' : 'Add another proof photo'}
            className="min-h-[44px] self-start"
          >
            📷 {photos.length === 0 ? 'Add photo' : 'Add another'}
          </Button>
        </>
      )}
    </div>
  );
}
