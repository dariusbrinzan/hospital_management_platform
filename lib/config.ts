// Configurație centralizată - poți modifica valorile direct aici
// Dacă vrei să folosești variabile de mediu, le poți suprascrie cu process.env

export const config = {
  // Application URL - folosit pentru API calls
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  
  // Admin Passkey - MODIFICĂ ACEASTĂ VALOARE CU PASSKEY-UL TĂU
  admin: {
    passkey: process.env.NEXT_PUBLIC_ADMIN_PASSKEY || "123456", // Schimbă această valoare!
  },
};
