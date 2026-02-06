import { FormProvider } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';

import { useRegistrationForm } from './hooks/useRegistrationForm';
import { useSaveRecord } from './hooks/useSaveRecord';

import { RegistrationHeader } from './components/RegistrationHeader';
import { FamilySelector } from './components/FamilySelector';
import { RecordTypeSelector } from './components/RecordTypeSelector';
import { RecordDetailsForm } from './components/RecordDetailsForm';
import { RecurrenceSection } from './components/RecurrenceSection';
import { SummarySection } from './components/SummarySection';

export function Registration() {
  const { state } = useLocation();
  const editRecord = state?.editRecord;

  const form = useRegistrationForm(editRecord);
  const saveRecord = useSaveRecord(editRecord);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((data) => saveRecord.mutate(data))}
        className="max-w-4xl mx-auto space-y-8"
      >
        <RegistrationHeader isEdit={!!editRecord} isLoading={saveRecord.isPending} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card title="Família e Responsável">
              <FamilySelector families={[]} />
            </Card>

            <Card title="Tipo de Registro">
              <RecordTypeSelector />
            </Card>

            <Card title="Informações do Lançamento">
              <RecordDetailsForm categories={[]} />
              <RecurrenceSection />
            </Card>
          </div>

          <SummarySection people={[]} />
        </div>
      </form>
    </FormProvider>
  );
}
