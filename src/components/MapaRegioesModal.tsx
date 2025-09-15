import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Importa estilos do Leaflet
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// Tipos do leaflet
import type { LatLngExpression } from "leaflet";

export function MapaRegioesModal() {
  const [open, setOpen] = useState(false);
  const [regioes, setRegioes] = useState<{ nome: string; position: [number, number] }[]>([
    { nome: "Região Central", position: [-23.55052, -46.633308] },
    { nome: "Região Norte", position: [-23.50052, -46.633308] },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState("");

  const handleAddRegiao = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!nome || isNaN(latNum) || isNaN(lngNum)) {
      setError("Preencha todos os campos corretamente.");
      return;
    }
    setRegioes([...regioes, { nome, position: [latNum, lngNum] }]);
    setNome("");
    setLat("");
    setLng("");
    setShowForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Visualizar Mapa
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Regiões de Atendimento</DialogTitle>
        </DialogHeader>
        <div className="mb-4 flex gap-2">
          {!showForm && (
            <button className="btn btn-success" onClick={() => setShowForm(true)}>
              Adicionar Região
            </button>
          )}
        </div>
        {showForm && (
          <form onSubmit={handleAddRegiao} className="mb-4 p-4 border rounded-lg bg-muted/30 flex flex-col gap-2 animate-fade-in">
            <label className="font-medium mb-1">Nome da Região
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="input mt-1" required />
            </label>
            <label className="font-medium mb-1">Latitude
              <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="input mt-1" required />
            </label>
            <label className="font-medium mb-1">Longitude
              <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="input mt-1" required />
            </label>
            {error && <span className="text-red-500 text-sm mt-2">{error}</span>}
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary">Salvar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        )}
        <div style={{ height: "400px", width: "100%" }}>
          {/* @ts-expect-error: react-leaflet v4.x apresenta erro de tipagem em center, mas funciona corretamente em runtime */}
          <MapContainer center={[-23.55052, -46.633308]} zoom={11} style={{ height: "100%", width: "100%" }}>
            {/* @ts-expect-error: attribution não tipado corretamente, mas funciona */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {regioes.map((regiao, idx) => (
              <Marker key={idx} position={regiao.position}>
                <Popup>{regiao.nome}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
