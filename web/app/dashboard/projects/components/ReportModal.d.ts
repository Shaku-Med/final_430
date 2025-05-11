export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export function ReportModal(props: ReportModalProps): JSX.Element; 