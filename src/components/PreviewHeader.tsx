import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PreviewHeaderProps {
  commentsCount: number;
  onExportComments: () => void;
}

export function PreviewHeader({
  commentsCount,
  onExportComments,
}: PreviewHeaderProps) {
  return (
    <CardHeader className="p-0 pb-4">
      <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg text-gray-800">Preview</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {commentsCount > 0 && (
            <Button
              onClick={onExportComments}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              Export Comments ({commentsCount})
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

