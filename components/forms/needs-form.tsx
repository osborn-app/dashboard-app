import React, { useEffect, useState } from "react";

type Fleet = { id: number; name: string };
type NeedsFormProps = {
  fleets: Fleet[];
  onSubmit: (form: { fleet_id: number; description: string; start_date: string; estimate_days: number }) => void;
};

export default function NeedsForm({ fleets, onSubmit }: NeedsFormProps) {
  const [search, setSearch] = useState("");
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimateDays, setEstimateDays] = useState(1);

  // Filter fleets by search
  const filteredFleets = fleets.filter(fleet =>
    fleet.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Tinjau Kebutuhan Maintenance</h2>
      <form className="space-y-6" onSubmit={e => {
        e.preventDefault();
        if (selectedFleet && startDate && estimateDays > 0) {
          onSubmit({
            fleet_id: selectedFleet.id,
            description,
            start_date: startDate,
            estimate_days: estimateDays,
          });
        }
      }}>
        {/* Armada & Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Armada</label>
            <input
              type="text"
              placeholder="Cari Armada..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input mb-2"
            />
            <select
              value={selectedFleet?.id ?? ""}
              onChange={e => {
                const fleet = fleets.find(f => f.id === Number(e.target.value));
                setSelectedFleet(fleet ?? null);
              }}
              className="input"
            >
              <option value="">Pilih Armada</option>
              {filteredFleets.map(fleet => (
                <option key={fleet.id} value={fleet.id}>{fleet.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium">Deskripsi</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input"
              placeholder="Deskripsi maintenance (opsional)"
              rows={4}
            />
          </div>
        </div>
        {/* Tanggal & Estimasi Hari */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="font-medium">Estimasi Hari</label>
            <input
              type="number"
              min={1}
              value={estimateDays}
              onChange={e => setEstimateDays(Number(e.target.value))}
              className="input"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button type="submit" className="btn-main">Konfirmasi</button>
        </div>
      </form>
    </div>
  );
}