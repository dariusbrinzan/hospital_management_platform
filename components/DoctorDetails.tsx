"use client";

import Image from "next/image";

interface DoctorDetailsProps {
  doctor: Doctor;
}

export const DoctorDetails = ({ doctor }: DoctorDetailsProps) => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-6">
        <div className="relative flex-shrink-0">
          <div className="size-30 overflow-hidden rounded-full border-2 border-green-500">
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={120}
              height={120}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{doctor.name}</h2>
            <p className="text-lg text-green-500 font-semibold">{doctor.specialty}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctor.age && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Vârstă</h3>
                <p className="text-base">{doctor.age} ani</p>
              </div>
            )}

            {doctor.experience && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Experiență</h3>
                <p className="text-base">{doctor.experience} ani de experiență</p>
              </div>
            )}

            {doctor.education && doctor.education.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Studii</h3>
                <div className="space-y-2">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-base font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {edu.country}
                          </span>
                          <span className="text-xs text-muted-foreground">{edu.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doctor.additionalSpecializations && doctor.additionalSpecializations.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Specializări suplimentare
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.additionalSpecializations.map((spec, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {doctor.languages && doctor.languages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Limbi vorbite</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {doctor.certifications && doctor.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Certificări</h3>
                <div className="space-y-1">
                  {doctor.certifications.map((cert, index) => (
                    <p key={index} className="text-sm">
                      • {cert}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
