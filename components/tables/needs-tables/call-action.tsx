import React from "react";

type CellActionProps = {
  row: any;
};

const CellAction: React.FC<CellActionProps> = ({ row }) => {
  const handleCreateNeeds = () => {
    // Implementasi aksi create needs, misal open modal atau redirect
    alert(`Create Needs untuk: ${row.original.name}`);
  };

  return (
    <button
      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={handleCreateNeeds}
    >
      Create Needs
    </button>
  );
};

export default CellAction;
