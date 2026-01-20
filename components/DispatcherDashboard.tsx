"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { AmbulanceCard } from "./AmbulanceCard";
import { MissionCard } from "./MissionCard";
import { NewMissionModal } from "./NewMissionModal";
import { Ambulance, AmbulanceMission } from "@/types";

interface DispatcherDashboardProps {
  ambulances: Ambulance[];
  activeMissions: AmbulanceMission[];
  allMissions: AmbulanceMission[];
}

export const DispatcherDashboard = ({
  ambulances,
  activeMissions,
  allMissions,
}: DispatcherDashboardProps) => {
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [selectedView, setSelectedView] = useState<"ambulances" | "missions">("ambulances");

  const availableCount = ambulances.filter((a) => a.status === "available").length;
  const onMissionCount = ambulances.filter((a) => a.status === "on_mission").length;
  const atHospitalCount = ambulances.filter((a) => a.status === "at_hospital").length;

  return (
    <div className="space-y-6">
      {/* Header cu statistici */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="header">Dashboard Dispecerat</h2>
            <p className="text-dark-600">
              Gestionați ambulanțele și misiunile de urgență
            </p>
          </div>
          <Button
            onClick={() => setShowNewMissionModal(true)}
            className="shad-primary-btn"
          >
            + Misiune Nouă
          </Button>
        </div>

        {/* Statistici rapide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-12-regular text-green-700 mb-1">Disponibile</p>
            <p className="text-24-bold text-green-900">{availableCount}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-12-regular text-blue-700 mb-1">În Misiune</p>
            <p className="text-24-bold text-blue-900">{onMissionCount}</p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="text-12-regular text-orange-700 mb-1">La Spital</p>
            <p className="text-24-bold text-orange-900">{atHospitalCount}</p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-12-regular text-purple-700 mb-1">Misiuni Active</p>
            <p className="text-24-bold text-purple-900">{activeMissions.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs pentru view */}
      <div className="flex gap-2 border-b border-dark-200">
        <button
          onClick={() => setSelectedView("ambulances")}
          className={`px-4 py-2 text-14-medium ${
            selectedView === "ambulances"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-dark-600 hover:text-dark-700"
          }`}
        >
          Ambulanțe ({ambulances.length})
        </button>
        <button
          onClick={() => setSelectedView("missions")}
          className={`px-4 py-2 text-14-medium ${
            selectedView === "missions"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-dark-600 hover:text-dark-700"
          }`}
        >
          Misiuni ({activeMissions.length} active)
        </button>
      </div>

      {/* Conținut */}
      {selectedView === "ambulances" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambulances.map((ambulance) => (
            <AmbulanceCard key={ambulance.$id} ambulance={ambulance} />
          ))}
        </div>
      )}

      {selectedView === "missions" && (
        <div className="space-y-4">
          {activeMissions.length > 0 ? (
            <>
              <h3 className="text-18-semibold text-dark-900">Misiuni Active</h3>
              <div className="space-y-3">
                {activeMissions.map((mission) => (
                  <MissionCard key={mission.$id} mission={mission} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dark-200 bg-white p-8 text-center">
              <p className="text-16-regular text-dark-600">
                Nu există misiuni active în acest moment
              </p>
            </div>
          )}

          {allMissions.filter((m) => m.status === "completed" || m.status === "cancelled").length > 0 && (
            <>
              <h3 className="text-18-semibold text-dark-900 mt-8">Istoric Misiuni</h3>
              <div className="space-y-3">
                {allMissions
                  .filter((m) => m.status === "completed" || m.status === "cancelled")
                  .slice(0, 10)
                  .map((mission) => (
                    <MissionCard key={mission.$id} mission={mission} />
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {showNewMissionModal && (
        <NewMissionModal
          ambulances={ambulances.filter((a) => a.status === "available")}
          onClose={() => setShowNewMissionModal(false)}
          onSuccess={() => {
            setShowNewMissionModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
