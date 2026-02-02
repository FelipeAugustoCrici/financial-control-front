import React, {useState, useEffect, useMemo} from 'react';
import _ from 'lodash';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useForm, FormProvider, useFormContext, useWatch} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Card} from '@/components/ui/Card';
import {Input, Select} from '@/components/ui/Input';
import {Button} from '@/components/ui/Button';
import {Save, X, FileText, Loader2, CheckCircle2, AlertCircle} from 'lucide-react';
import {financeService} from '@/services/api';
import {useNavigate, useLocation} from 'react-router-dom';
import {Person} from '@/types';

const registrationSchema = z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    value: z.string().min(1, 'Valor é obrigatório').refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Valor deve ser um número positivo'),
    date: z.string().min(1, 'Data é obrigatória'),
    categoryName: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(['expense', 'salary', 'income']),
    personId: z.string().min(1, 'Responsável é obrigatório'),
    familyId: z.string().min(1, 'Família é obrigatória'),
    isRecurring: z.boolean(),
    durationMonths: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const SummarySection = ({people}: { people: Person[] }) => {
    const {control} = useFormContext<RegistrationFormData>();
    const watchedValues = useWatch({control});

    const personName = _.find(people, {id: watchedValues.personId})?.name || '-';
    const formattedDate = watchedValues.date ? new Date(watchedValues.date).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    }) : '-';
    const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(parseFloat(watchedValues.value || '0') || 0);

    return (
        <Card title="Resumo" className="bg-primary-50 border-primary-200">
            <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-primary-200">
                    <span className="text-sm text-primary-500">Responsável</span>
                    <span className="text-sm font-bold text-primary-800">{personName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-primary-200">
                    <span className="text-sm text-primary-500">Mês</span>
                    <span className="text-sm font-bold text-primary-800">{formattedDate}</span>
                </div>
                <div className="pt-4">
                    <p className="text-xs text-primary-500 mb-1 uppercase tracking-wider font-bold">
                        Total do Registro
                    </p>
                    <p className="text-3xl font-bold text-primary-900">{formattedValue}</p>
                </div>
            </div>
        </Card>
    );
};

export const Registration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [people, setPeople] = useState<Person[]>([]);

    const editRecord = location.state?.editRecord;

    const methods = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: useMemo(() => {
            if (editRecord) {
                let type: 'expense' | 'salary' | 'income' = 'expense';
                if (editRecord.type === 'income') {
                    if (editRecord.description === 'Salário' || editRecord.salaryId) type = 'salary';
                    else if (editRecord.sourceId || editRecord.type === 'fixed') type = 'salary'; // Mapeando salário recorrente
                    else type = 'income';
                }

                // Ajuste fino para tipos baseados na estrutura de dados do backend
                let finalType: 'expense' | 'salary' | 'income' = editRecord.type === 'expense' ? 'expense' : 'income';
                if (editRecord.description === 'Salário' || editRecord.salaryId || editRecord.sourceId) finalType = 'salary';
                if (editRecord.type === 'income' && finalType !== 'salary') finalType = 'income';

                return {
                    description: editRecord.description || '',
                    value: String(editRecord.value || ''),
                    date: editRecord.date ? new Date(editRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    categoryName: editRecord.categoryName || editRecord.category?.name || 'outros',
                    categoryId: editRecord.categoryId || '',
                    type: finalType,
                    personId: editRecord.personId || '',
                    familyId: editRecord.familyId || '',
                    isRecurring: !!(editRecord.recurringId || editRecord.sourceId || editRecord.isRecurring),
                    durationMonths: '',
                };
            }
            return {
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
            };
        }, [editRecord])
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors}
    } = methods;

    const watchedType = watch('type');
    const watchedFamilyId = watch('familyId');
    const watchedIsRecurring = watch('isRecurring');

    const {data: families = [], isLoading: loadingFamilies} = useQuery({
        queryKey: ['families'],
        queryFn: financeService.getFamilies,
    });

    const {data: categories = [], isLoading: loadingCategories} = useQuery({
        queryKey: ['categories'],
        queryFn: financeService.getCategories,
    });

    const loadingContext = loadingFamilies || loadingCategories;

    useEffect(() => {
        if (families.length > 0 && !watchedFamilyId) {
            const firstFamily = families[0];
            setValue('familyId', firstFamily.id);
            if (firstFamily.members?.length > 0) {
                setValue('personId', firstFamily.members[0].id);
            }
            setPeople(firstFamily.members || []);
        }
    }, [families, watchedFamilyId, setValue]);

    useEffect(() => {
        if (watchedFamilyId) {
            const selectedFamily = _.find(families, {id: watchedFamilyId});
            const familyMembers = selectedFamily?.members || [];
            setPeople(familyMembers);
            // Se o membro atual não pertence à nova família, reseta
            const currentPersonId = methods.getValues('personId');
            if (!_.find(familyMembers, {id: currentPersonId})) {
                setValue('personId', familyMembers.length > 0 ? familyMembers[0].id : '');
            }
        }
    }, [watchedFamilyId, families, setValue, methods]);

    const saveRecordMutation = useMutation({
        mutationFn: async (data: RegistrationFormData) => {
            const val = parseFloat(data.value);
            const recordId = editRecord?.id;

            if (data.type === 'salary' || data.type === 'income') {
                let incomeType: 'fixed' | 'flex' | 'temporary' = 'flex';

                if (data.type === 'salary') {
                    incomeType = data.isRecurring ? 'fixed' : 'flex';
                } else if (data.type === 'income') {
                    incomeType = 'flex';
                }

                const payload = {
                    description: data.description,
                    value: val,
                    date: data.date,
                    personId: data.personId,
                    type: incomeType,
                    isRecurring: data.isRecurring,
                    durationMonths: data.durationMonths ? parseInt(data.durationMonths) : undefined,
                };

                if (recordId) {
                    let type: 'salary' | 'extra' | 'income' | 'expense' = 'income';
                    if (editRecord.description === 'Salário' || editRecord.salaryId) type = 'salary';
                    else if (editRecord.sourceId || editRecord.type === 'fixed') type = 'income';
                    else type = 'extra';

                    return financeService.updateRecord(type, recordId, payload);
                }

                return financeService.addIncome(payload);
            } else {
                const payload = {
                    description: data.description,
                    value: val,
                    categoryName: data.categoryName || 'outros',
                    categoryId: data.categoryId || undefined,
                    type: 'variable' as const,
                    date: data.date,
                    personId: data.personId,
                    isRecurring: data.isRecurring,
                    durationMonths: data.durationMonths ? parseInt(data.durationMonths) : undefined,
                };

                if (recordId) {
                    return financeService.updateRecord('expense', recordId, payload);
                }

                return financeService.addExpense(payload);
            }
        },
        onSuccess: () => {
            setSuccess(true);
            queryClient.invalidateQueries({queryKey: ['summary']});
            queryClient.invalidateQueries({queryKey: ['expenses']});
            queryClient.invalidateQueries({queryKey: ['extras']});

            reset({
                ...methods.getValues(),
                description: '',
                value: '',
            });

            setTimeout(() => navigate('/'), 2000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || err.message || 'Erro ao salvar lançamento.');
        },
    });

    const onSubmit = (data: RegistrationFormData) => {
        setError(null);
        setSuccess(false);
        saveRecordMutation.mutate(data);
    };

    const isLoading = saveRecordMutation.isPending;

    if (loadingContext) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500"/>
            </div>
        );
    }

    const renderPlaceholder = () => {
        if (watchedType === 'salary') return 'Ex: Salário Mensal, Horas Extras...';
        if (watchedType === 'income') return 'Ex: Bônus, PIS, Renda Extra...';
        return 'Ex: Aluguel, Supermercado, Bônus...';
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-800">
                            {editRecord ? 'Editar Lançamento' : 'Novo Lançamento'}
                        </h2>
                        <p className="text-primary-500">
                            {editRecord ? 'Atualize os dados do registro financeiro' : 'Registre dados financeiros por família e pessoa'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                            <X size={18} className="mr-2"/> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || (families.length > 0 && people.length === 0)}
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="mr-2 animate-spin"/>
                            ) : (
                                <Save size={18} className="mr-2"/>
                            )}
                            {editRecord ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
                        </Button>
                    </div>
                </div>

                {success && (
                    <div
                        className="bg-success-50 border border-success-200 text-success-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 size={24}/>
                        <div>
                            <p className="font-bold">Sucesso!</p>
                            <p className="text-sm">Seu lançamento foi registrado.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div
                        className="bg-danger-50 border border-danger-200 text-danger-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle size={24}/>
                        <div>
                            <p className="font-bold">Erro</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card title="Família e Responsável" className="border-t-4 border-t-primary-600">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Selecionar Família"
                                    {...register('familyId')}
                                    error={errors.familyId?.message}
                                    options={_.map(families, (f) => ({value: f.id, label: f.name}))}
                                    disabled={families.length === 0}
                                />

                                <Select
                                    label="Membro Responsável"
                                    {...register('personId')}
                                    error={errors.personId?.message}
                                    options={_.map(people, (p) => ({value: p.id, label: p.name}))}
                                    disabled={people.length === 0}
                                />
                            </div>
                            {families.length === 0 && (
                                <p className="mt-4 text-sm text-danger-500 bg-danger-50 p-3 rounded-lg border border-danger-100">
                                    Nenhuma família cadastrada. Por favor, cadastre uma família na tela de "Famílias" antes
                                    de realizar lançamentos.
                                </p>
                            )}
                        </Card>

                        <Card title="Tipo de Registro">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {_.map(
                                    [
                                        {
                                            id: 'expense',
                                            label: 'Despesa',
                                            color: 'peer-checked:border-danger-500 peer-checked:bg-danger-50',
                                        },
                                        {
                                            id: 'salary',
                                            label: 'Salário',
                                            color: 'peer-checked:border-primary-600 peer-checked:bg-primary-50',
                                        },
                                        {
                                            id: 'income',
                                            label: 'Extra/Bônus',
                                            color: 'peer-checked:border-success-500 peer-checked:bg-success-50',
                                        },
                                    ],
                                    (t) => (
                                        <label key={t.id} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                {...register('type')}
                                                value={t.id}
                                                className="hidden peer"
                                            />
                                            <div
                                                className={`p-3 border-2 border-primary-100 rounded-xl text-center font-semibold text-primary-600 transition-all text-xs sm:text-sm ${t.color}`}
                                            >
                                                {t.label}
                                            </div>
                                        </label>
                                    ),
                                )}
                            </div>
                        </Card>

                        <Card title="Informações do Lançamento">
                            <div className="space-y-4">
                                <Input
                                    label="Descrição"
                                    {...register('description')}
                                    error={errors.description?.message}
                                    placeholder={renderPlaceholder()}
                                    icon={<FileText size={18}/>}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Valor (R$)"
                                        type="number"
                                        step="0.01"
                                        {...register('value')}
                                        error={errors.value?.message}
                                        placeholder="0,00"
                                    />
                                    {watchedType === 'expense' && (
                                        <Select
                                            label="Categoria"
                                            {...register('categoryId')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setValue('categoryId', val);
                                                const selectedCat = _.find(categories, {id: val});
                                                if (selectedCat) {
                                                    setValue('categoryName', selectedCat.name);
                                                }
                                            }}
                                            error={errors.categoryId?.message}
                                            options={[
                                                {value: '', label: 'Selecione uma categoria'},
                                                ..._.map(_.filter(categories, {type: 'expense'}), (c) => ({
                                                    value: c.id,
                                                    label: c.name,
                                                })),
                                                {value: 'outros', label: 'Outros'},
                                            ]}
                                        />
                                    )}
                                </div>

                                <Input
                                    label="Data de Referência"
                                    type="date"
                                    {...register('date')}
                                    error={errors.date?.message}
                                />
                            </div>

                            {(watchedType === 'expense' || watchedType === 'salary') && (
                                <div className="mt-6 pt-6 border-t border-primary-50 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isRecurring"
                                            {...register('isRecurring')}
                                            className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                                        />
                                        <label htmlFor="isRecurring" className="text-sm font-bold text-primary-800">
                                            Este é um lançamento recorrente (Gera automático todo mês)
                                        </label>
                                    </div>

                                    {watchedIsRecurring && (
                                        <div
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                            <Input
                                                label="Duração (meses)"
                                                type="number"
                                                {...register('durationMonths')}
                                                error={errors.durationMonths?.message}
                                                placeholder="Ex: 12 (deixe vazio para indefinido)"
                                                min="0"
                                            />
                                            <div className="flex items-end pb-2">
                                                <p className="text-xs text-primary-500 italic">
                                                    O sistema gerará este lançamento automaticamente nos meses futuros.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <SummarySection people={people} />
                    </div>
                </div>
            </form>
        </FormProvider>
    );
};