import React from 'react';
import { Modal } from '../common/Modal';
import { AIRiskCard } from './AIRiskCard';
import { AtRiskStudent } from '../../types/ai';

interface AIRiskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: AtRiskStudent | null;
  onNavigateToProfile?: (studentId: string) => void;
}

export const AIRiskDetailModal: React.FC<AIRiskDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onNavigateToProfile
}) => {
  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Academic Intelligence Breakdown`}
      subtitle={`Detailed evidence analysis & recommended interventions for ${student.name}`}
      maxWidth="xl"
    >
      <AIRiskCard
        student={student}
        onViewProfile={(id) => {
          onClose();
          if (onNavigateToProfile) onNavigateToProfile(id);
        }}
      />
    </Modal>
  );
};
