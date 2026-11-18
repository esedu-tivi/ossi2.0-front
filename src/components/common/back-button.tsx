import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackButton = (
  props: React.ComponentProps<typeof Button>
) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      className="mb-2.5"
      onClick={() => navigate(-1)}
      {...props}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Palaa
    </Button>
  );
};

export default BackButton;
