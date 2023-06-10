import { capitalize } from "expensasaures/shared/utils/common";
import EModal from ".";

interface Props {
  isOpen: boolean;
  resource: "expense" | 'budget';
  onClose: () => void;
  action: "delete";
  onAction: () => void;
}

const DeleteModal = (props: Props) => {
  const { isOpen, onClose, resource, action, onAction } = props;
  //   const isExpense = resource === "expense";
  const title = `Delete ${capitalize(resource)}`;
  const isActionDelete = action === "delete";
  const message = `Are you sure you want to delete this ${resource}? Deleting this ${resource} will remove it from your records and cannot be undone.`;

  return (
    <EModal
      onAction={onAction}
      title={title}
      action="delete"
      description={message}
      primaryCtaText="Delete"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default DeleteModal;
