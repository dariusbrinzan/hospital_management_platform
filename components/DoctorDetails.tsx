"use client";

import Image from "next/image";

interface DoctorDetailsProps {
  doctor: Doctor;
}

export const DoctorDetails = ({ doctor }: DoctorDetailsProps) => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-6">
        <div className="relative flex-shrink-0">
          <div className="size-30 overflow-hidden rounded-full border-2 border-teal-500/70">
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{doctor.name}</h2>
            <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">{doctor.specialty}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctor.age && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Varsta</h3>
                <p className="text-base text-slate-900 dark:text-slate-100">{doctor.age} ani</p>
              </div>
            )}

            {doctor.experience && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Experienta</h3>
                <p className="text-base text-slate-900 dark:text-slate-100">{doctor.experience} ani de experienta</p>
              </div>
            )}

            {doctor.education && doctor.education.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Studii</h3>
                <div className="space-y-2">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-base font-medium text-slate-900 dark:text-slate-100">{edu.degree}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{edu.institution}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                            {edu.country}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{edu.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doctor.additionalSpecializations && doctor.additionalSpecializations.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Specializari suplimentare
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.additionalSpecializations.map((spec, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-teal-100 px-3 py-1 text-xs text-teal-800 dark:bg-teal-900/40 dark:text-teal-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {doctor.languages && doctor.languages.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Limbi vorbite</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {doctor.certifications && doctor.certifications.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Certificari</h3>
                <div className="space-y-1">
                  {doctor.certifications.map((cert, index) => (
                    <p key={index} className="text-sm text-slate-700 dark:text-slate-300">
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
