import React from 'react';

interface NotasFiscaisSyncManagerProps {
  onSyncComplete?: () => void;
}

export const NotasFiscaisSyncManager: React.FC<NotasFiscaisSyncManagerProps> = ({
  onSyncComplete
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center text-gray-500">
        <p>Funcionalidade de sincronização removida.</p>
      </div>
    </div>
  );
};
