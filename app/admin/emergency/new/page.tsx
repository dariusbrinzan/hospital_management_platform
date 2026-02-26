import { NewEmergencyCaseForm } from "@/components/forms/NewEmergencyCaseForm";
import { AdminPageLayout } from "@/components/AdminPageLayout";

const NewEmergencyCasePage = () => {
  return (
    <AdminPageLayout
      title="Caz nou — Primiri urgențe"
      description="Identificare pacient (existent sau nou), triaj și motiv prezentare. Medicul de gardă va fi alocat automat."
      backHref="/admin/emergency"
    >
      <NewEmergencyCaseForm />
    </AdminPageLayout>
  );
};

export default NewEmergencyCasePage;
