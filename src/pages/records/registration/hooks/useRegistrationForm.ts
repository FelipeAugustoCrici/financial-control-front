import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationFormData } from '../schemas/registration.schema';
import { resolveEditDefaults } from '../utils/resolve-edit-defaults';

export function useRegistrationForm(editRecord?: any) {
  return useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: resolveEditDefaults(editRecord) || {
      description: '',
      value: '',
      date: new Date().toISOString().split('T')[0],
      categoryName: 'outros',
      categoryId: '',
      type: 'expense',
      personId: '',
      familyId: '',
      isRecurring: false,
      durationMonths: '',
    },
  });
}
