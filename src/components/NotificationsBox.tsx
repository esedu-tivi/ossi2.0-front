import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

const NotificationsBox = () => (
  <Card>
    <CardContent className="flex items-start gap-3 p-4">
      <Info className="mt-0.5 h-5 w-5 text-primary shrink-0" />
      <p className="text-sm text-muted-foreground">
        T&auml;ss&auml; voi olla esimerkiksi ilmoitus palautetusta projektista, inaktiivisest&auml; k&auml;ytt&auml;j&auml;tilist&auml; tai muusta vastaavasta.
      </p>
    </CardContent>
  </Card>
);

export default NotificationsBox;
