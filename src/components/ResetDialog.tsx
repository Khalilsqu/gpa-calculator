import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

interface ResetDialogProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
}

const ResetDialog = ({ open, onClose, onReset }: ResetDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Reset All Data</DialogTitle>
    <DialogContent>
      Repeat and new courses will be deleted. GPA records will be set to 0. Are
      you sure you want to reset all data?
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onReset} color="primary">
        Reset
      </Button>
    </DialogActions>
  </Dialog>
);

export default ResetDialog;
