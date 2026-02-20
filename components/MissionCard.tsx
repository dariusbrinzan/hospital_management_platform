"use client";

import { formatDateTime } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";

type MissionWithPartialAmbulance = Omit<AmbulanceMission, "ambulance"> & { ambulance?: Partial<Ambulance> | null };

interface MissionCardProps {
  mission: MissionWithPartialAmbulance;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  dispatched: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  en_route: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  at_scene: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  transporting: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  at_hospital: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  completed: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const statusLabels: Record<string, string> = {
  dispatched: "Trimisă",
  en_route: "În Drum",
  at_scene: "La Locație",
  transporting: "Transportare",
  at_hospital: "La Spital",
  completed: "Completată",
  cancelled: "Anulată",
};

const priorityColors: Record<number, string> = {
  1: "bg-red-600",
  2: "bg-red-500",
  3: "bg-orange-500",
  4: "bg-orange-400",
  5: "bg-yellow-400",
  6: "bg-yellow-300",
  7: "bg-blue-300",
  8: "bg-blue-200",
  9: "bg-gray-200",
  10: "bg-gray-100",
};

export const MissionCard = ({ mission }: MissionCardProps) => {
  const statusColor = statusColors[mission.status] || statusColors.dispatched;
  const priorityColor = priorityColors[mission.priority] || priorityColors[5];

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/ambulances/missions/${mission.$id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Eroare la actualizarea statusului");
      }
    } catch (error) {
      console.error("Error updating mission status:", error);
      alert("Eroare la actualizarea statusului");
    }
  };

  return (
    <div className={`rounded-lg border ${statusColor.border} ${statusColor.bg} p-6 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-18-semibold text-dark-900">
              {mission.patientName || "Pacient necunoscut"}
            </h3>
            <span className={`px-2 py-1 rounded text-12-semibold text-white ${priorityColor}`}>
              Prioritate {mission.priority}
            </span>
          </div>
          <p className="text-14-regular text-dark-600 mb-1">
            {mission.ambulance?.ambulanceNumber || "N/A"}
          </p>
          <p className="text-12-regular text-dark-500">
            Trimisă: {formatDateTime(mission.dispatchedAt).dateTime}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-12-semibold ${statusColor.text} ${statusColor.bg} border ${statusColor.border}`}>
          {statusLabels[mission.status] || mission.status}
        </span>
      </div>

      {/* Informații misiune */}
      <div className="space-y-2 mb-4">
        <div>
          <p className="text-14-semibold text-dark-700">Motiv:</p>
          <p className="text-14-regular text-dark-600">{mission.chiefComplaint}</p>
        </div>
        <div>
          <p className="text-14-semibold text-dark-700">Locație preluare:</p>
          <p className="text-14-regular text-dark-600">{mission.pickupLocation.address}</p>
        </div>
        {mission.destinationLocation && (
          <div>
            <p className="text-14-semibold text-dark-700">Destinație:</p>
            <p className="text-14-regular text-dark-600">{mission.destinationLocation.address}</p>
          </div>
        )}
        <div>
          <p className="text-14-semibold text-dark-700">Apelant:</p>
          <p className="text-14-regular text-dark-600">
            {mission.callerName || "Necunoscut"} - {mission.callerPhone}
          </p>
        </div>
      </div>

      {/* Timestamps */}
      <div className="mb-4 space-y-1 text-12-regular text-dark-500">
        {mission.enRouteAt && (
          <p>În drum: {formatDateTime(mission.enRouteAt).dateTime}</p>
        )}
        {mission.atSceneAt && (
          <p>La locație: {formatDateTime(mission.atSceneAt).dateTime}</p>
        )}
        {mission.transportingAt && (
          <p>Transportare: {formatDateTime(mission.transportingAt).dateTime}</p>
        )}
        {mission.atHospitalAt && (
          <p>La spital: {formatDateTime(mission.atHospitalAt).dateTime}</p>
        )}
        {mission.completedAt && (
          <p>Completată: {formatDateTime(mission.completedAt).dateTime}</p>
        )}
      </div>

      {/* Acțiuni */}
      <div className="flex flex-wrap gap-2">
        {mission.status === "dispatched" && (
          <Button
            onClick={() => handleStatusUpdate("en_route")}
            className="shad-primary-btn text-12-medium"
            size="sm"
          >
            Ambulanța a plecat
          </Button>
        )}
        {mission.status === "en_route" && (
          <Button
            onClick={() => handleStatusUpdate("at_scene")}
            className="shad-primary-btn text-12-medium"
            size="sm"
          >
            Ambulanța a ajuns la locație
          </Button>
        )}
        {mission.status === "at_scene" && (
          <Button
            onClick={() => handleStatusUpdate("transporting")}
            className="shad-primary-btn text-12-medium"
            size="sm"
          >
            Începe transportarea
          </Button>
        )}
        {mission.status === "transporting" && (
          <Button
            onClick={() => handleStatusUpdate("at_hospital")}
            className="shad-primary-btn text-12-medium"
            size="sm"
          >
            Ambulanța a ajuns la spital
          </Button>
        )}
        {mission.status === "at_hospital" && (
          <>
            <Button
              onClick={() => handleStatusUpdate("completed")}
              className="shad-primary-btn text-12-medium"
              size="sm"
            >
              Misiune completată
            </Button>
            {mission.emergencyCase && (
              <Link href={`/admin/emergency/${mission.emergencyCase.$id}`}>
                <Button className="shad-gray-btn text-12-medium" size="sm">
                  Vezi Caz Urgență
                </Button>
              </Link>
            )}
          </>
        )}
        {mission.status !== "completed" && mission.status !== "cancelled" && (
          <Button
            onClick={() => {
              const reason = prompt("Motiv anulare:");
              if (reason) {
                fetch(`/api/ambulances/missions/${mission.$id}`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ reason }),
                }).then(() => window.location.reload());
              }
            }}
            className="shad-gray-btn text-12-medium bg-red-50 text-red-700 hover:bg-red-100"
            size="sm"
          >
            Anulează
          </Button>
        )}
      </div>
    </div>
  );
};
