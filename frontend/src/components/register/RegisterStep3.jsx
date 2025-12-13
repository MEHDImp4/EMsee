import React from 'react';
import { GraduationCap, School } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StudentFields = ({ form, setField, options, showErrors }) => {
    const { t } = useTranslation();
    const { filiere, year } = form;
    const { filieresWithPrepa } = options;
    const FILIERE_KEYS = ['iir', 'gesi', 'iaii', 'gcb', 'gi', 'gf'];

    return (
        <div className="student-fields">
            <div className="form-group">
                <label className="form-label" htmlFor="filiereSelect">{t('auth.field_of_study')}</label>
                <div className="input-wrapper">
                    <GraduationCap size={20} className="input-icon" aria-hidden="true" />
                    <select
                        id="filiereSelect"
                        className="form-input select-none-appearance"
                        value={filiere}
                        onChange={(e) => {
                            setField('filiere', e.target.value);
                            setField('year', '');
                        }}
                        aria-invalid={showErrors && !filiere ? "true" : "false"}
                        style={{ borderColor: showErrors && !filiere ? 'var(--danger)' : undefined }}
                    >
                        <option value="">{t('auth.select_filiere')}</option>
                        {FILIERE_KEYS.map((key) => (
                            <option key={key} value={key}>{t(`lists.filieres.${key}`)}</option>
                        ))}
                    </select>
                </div>
                {showErrors && !filiere && <p className="error-message" role="alert">{t('auth.field_required')}</p>}
            </div>

            {filiere && (
                <div className="form-group">
                    <label className="form-label" htmlFor="yearSelect">{t('auth.year_study')}</label>
                    <div className="input-wrapper">
                        <School size={20} className="input-icon" aria-hidden="true" />
                        <select
                            id="yearSelect"
                            className="form-input select-none-appearance"
                            value={year}
                            onChange={(e) => setField('year', e.target.value)}
                            aria-invalid={showErrors && !year ? "true" : "false"}
                            style={{ borderColor: showErrors && !year ? 'var(--danger)' : undefined }}
                        >
                            <option value="">{t('auth.select_year')}</option>
                            {filieresWithPrepa.includes(filiere) ? (
                                <>
                                    <option value="prepa_1">{t('lists.years.prepa_1')}</option>
                                    <option value="prepa_2">{t('lists.years.prepa_2')}</option>
                                    <option value="cycle_1">{t('lists.years.cycle_1')}</option>
                                    <option value="cycle_2">{t('lists.years.cycle_2')}</option>
                                    <option value="cycle_3">{t('lists.years.cycle_3')}</option>
                                </>
                            ) : (
                                <>
                                    <option value="year_1">{t('lists.years.year_1')}</option>
                                    <option value="year_2">{t('lists.years.year_2')}</option>
                                    <option value="year_3">{t('lists.years.year_3')}</option>
                                    <option value="year_4">{t('lists.years.year_4')}</option>
                                    <option value="year_5">{t('lists.years.year_5')}</option>
                                </>
                            )}
                        </select>
                    </div>
                    {showErrors && !year && <p className="error-message" role="alert">{t('auth.field_required')}</p>}
                </div>
            )}
            {year && (
                <div className="form-group">
                    <label className="form-label" htmlFor="classInput">{t('auth.class_name', 'Classe (ex: IIR10, GI2)')}</label>
                    <div className="input-wrapper">
                        <School size={20} className="input-icon" aria-hidden="true" />
                        <input
                            id="classInput"
                            type="text"
                            className="form-input"
                            value={form.studentClass || ''}
                            onChange={(e) => setField('studentClass', e.target.value.toUpperCase())}
                            placeholder={t('auth.class_placeholder', 'Entrez votre classe (ex: GI1, IER10...)')}
                            aria-invalid={showErrors && !form.studentClass ? "true" : "false"}
                            style={{ borderColor: showErrors && !form.studentClass ? 'var(--danger)' : undefined }}
                        />
                    </div>
                    {showErrors && !form.studentClass && <p className="error-message" role="alert">{t('auth.field_required')}</p>}
                </div>
            )}
        </div>
    );
};

const ProfessorFields = ({ form, toggleSubject, options, showErrors }) => {
    const { t } = useTranslation();
    const { selectedSubjects } = form;
    const { availableSubjects } = options;

    return (
        <div className="professor-fields">
            <label className="form-label" id="subjects-label">{t('auth.subjects_taught')}</label>
            <div className="subject-grid" role="group" aria-labelledby="subjects-label">
                {availableSubjects.map((subjectKey) => (
                    <button
                        key={subjectKey}
                        type="button"
                        onClick={() => toggleSubject(subjectKey)}
                        className={`subject-badge ${selectedSubjects.includes(subjectKey) ? 'active' : ''}`}
                        aria-pressed={selectedSubjects.includes(subjectKey)}
                    >
                        {t(`lists.subjects.${subjectKey}`)}
                    </button>
                ))}
            </div>
            {showErrors && selectedSubjects.length === 0 && (
                <p className="error-message error-mt" role="alert">{t('auth.select_at_least_one')}</p>
            )}
        </div>
    );
};

const RegisterStep3 = (props) => {
    const { isProfessor, form, setField, toggleSubject, options, showErrors } = props;

    if (isProfessor) {
        return (
            <ProfessorFields
                form={form}
                toggleSubject={toggleSubject}
                options={options}
                showErrors={showErrors}
            />
        );
    }

    return (
        <StudentFields
            form={form}
            setField={setField}
            options={options}
            showErrors={showErrors}
        />
    );
};

export default RegisterStep3;
