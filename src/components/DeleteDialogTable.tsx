import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { useFetcher } from "react-router-dom";

const DeleteDialogTable = ({
  isRepeat,
  open,
  setOpen,
  recordID,
}: {
  isRepeat: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  recordID: string;
}) => {
  const fetcher = useFetcher();

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    const formData = new FormData();
    formData.append("recordID", recordID);

    if (isRepeat) formData.append("actionType", "deleteCourseRepeatTable");
    else formData.append("actionType", "deleteCourseNewTable");

    fetcher.submit(formData, {
      method: "POST",
      action: "",
    });

    setOpen(false);
  };

  return (
    <>
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
    </>
  );
};

export default DeleteDialogTable;
