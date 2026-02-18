import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface IdleWarningDialogProps {
  open: boolean;
  onContinue: () => void;
  onLogout: () => void;
}

const IdleWarningDialog = ({ open, onContinue, onLogout }: IdleWarningDialogProps) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you still there?</AlertDialogTitle>
        <AlertDialogDescription>
          We noticed that you've been inactive. To protect your information, you will be logged out in one minute.
          <br /><br />
          Do you want to continue?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button variant="outline" onClick={onContinue}>Continue</Button>
        <Button variant="destructive" onClick={onLogout}>Log Out</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default IdleWarningDialog;
