import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AppDialogProps {
  title: string;
  open: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

const AppDialog = ({ title, open, onClose, children }: AppDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(v) => {
      if (!v) onClose(false);
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="sr-only">{title}</DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);

export default AppDialog;
