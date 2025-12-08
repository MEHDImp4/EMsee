
import React from 'react';
import { GraduationCap, School } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegisterStep3 = ({
    isProfessor,
    availableSubjects,
    selectedSubjects,
    toggleSubject,
    showErrors
}) => {
    const { t } = useTranslation();

    if (!isProfessor) {
        return (
            <div className="student-fields">
                <div className="form-group">
                    <label className="form-label" htmlFor="studyLevel">{t('auth.study_level')}</label>
                    <div className="input-wrapper">
                        <GraduationCap size={20} className="input-icon" aria-hidden="true" />
                        <select id="studyLevel" className="form-input select-none-appearance">
                            <option value="">{t('auth.select_level')}</option>
                            <option value="1ap">{t('auth.year_1_prepa')}</option>
                            <option value="2ap">{t('auth.year_2_prepa')}</option>
                            <option value="3iir">{t('auth.year_3_iir')}</option>
                            <option value="4iir">{t('auth.year_4_iir')}</option>
                            <option value="5iir">{t('auth.year_5_iir')}</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="classInput">{t('auth.class')}</label>
                    <div className="input-wrapper">
                        <School size={20} className="input-icon" aria-hidden="true" />
                        <input
                            id="classInput"
                            type="text"
                            placeholder={t('auth.class_placeholder', 'Ex: G1, G2...')}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="professor-fields">
            <label className="form-label" id="subjects-label">{t('auth.subjects_taught')}</label>
            <div className="subject-grid" role="group" aria-labelledby="subjects-label">
                {availableSubjects.map(subject => (
                    <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className={`subject-badge ${selectedSubjects.includes(subject) ? 'active' : ''}`}
                        aria-pressed={selectedSubjects.includes(subject)}
                    >
                        {subject}
                    </button>
                ))}
            </div>
            {showErrors && selectedSubjects.length === 0 && (
                <p className="error-message error-mt" role="alert">{t('auth.select_at_least_one')}</p>
            )}
        </div>
    );
};

export default RegisterStep3;
