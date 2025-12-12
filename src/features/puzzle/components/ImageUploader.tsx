import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SampleImage } from '@/types/puzzle';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  onLoadSample: (url: string) => void;
  samples: SampleImage[];
}

export function ImageUploader({ onUpload, onLoadSample, samples }: ImageUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-8">
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-4 p-8">
          <div className="bg-secondary p-4 rounded-full">
            <Upload size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Upload Photo</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose an image to start</p>
          </div>
          <Button size="lg" className="mt-4 shadow-lg" asChild>
            <label className="cursor-pointer">
              Browse Files
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs font-semibold uppercase tracking-wider">Or try a sample</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {samples.map((sample) => (
            <button
              key={sample.label}
              onClick={() => onLoadSample(sample.url)}
              className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <img
                src={sample.url}
                alt={sample.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-xs font-medium text-white">{sample.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
