import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const DeleteDialogTable = ({
  open,
  setOpen,
  recordID,
  deleteAction,
  isRepeat, // Add `isRepeat` prop
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  recordID: string;
  deleteAction: (id: string, isRepeat: boolean) => void; // Update type
  isRepeat: boolean; // Add `isRepeat` prop type
}) => {
  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    deleteAction(recordID, isRepeat); // Pass `isRepeat`
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Delete Course?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete this course? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirm} autoFocus color="error">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialogTable;
