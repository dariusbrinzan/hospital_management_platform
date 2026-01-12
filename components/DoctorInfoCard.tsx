"use client";

import Image from "next/image";

interface DoctorInfoCardProps {
  doctor: Doctor;
}

export const DoctorInfoCard = ({ doctor }: DoctorInfoCardProps) => {
  return (
    <div className="rounded-lg border border-dark-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="size-20 overflow-hidden rounded-full border-2 border-green-500">
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={80}
              height={80}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-dark-700">{doctor.name}</h3>
            <p className="text-sm text-green-500 font-medium">{doctor.specialty}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {doctor.experience && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Experiență:</span>
                <span className="text-sm text-dark-700">{doctor.experience} ani</span>
              </div>
            )}

            {doctor.age && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Vârstă:</span>
                <span className="text-sm text-dark-700">{doctor.age} ani</span>
              </div>
            )}
          </div>

          {doctor.education && doctor.education.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Studii:</p>
              <div className="space-y-2">
                {doctor.education.slice(0, 2).map((edu, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-700">{edu.degree}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {edu.country}
                        </span>
                        <span className="text-xs text-muted-foreground">{edu.institution}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {doctor.education.length > 2 && (
                  <p className="text-xs text-muted-foreground italic">
                    + {doctor.education.length - 2} alte studii
                  </p>
                )}
              </div>
            </div>
          )}

          {doctor.additionalSpecializations && doctor.additionalSpecializations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Specializări suplimentare:
              </p>
              <div className="flex flex-wrap gap-2">
                {doctor.additionalSpecializations.slice(0, 3).map((spec, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {spec}
                  </span>
                ))}
                {doctor.additionalSpecializations.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{doctor.additionalSpecializations.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {doctor.languages && doctor.languages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Limbi vorbite:</p>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
