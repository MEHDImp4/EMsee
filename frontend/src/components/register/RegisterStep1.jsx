
import React from 'react';
import { GraduationCap, BookOpen, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegisterStep1 = ({ accountType, setAccountType }) => {
    const { t } = useTranslation();

    return (
        <div className="account-type-selector account-type-selector-col">
            <button
                type="button"
                onClick={() => setAccountType('student')}
                className={`type-btn-large ${accountType === 'student' ? 'active' : ''}`}
            >
                <div className="icon-box"><GraduationCap size={32} /></div>
                <div>
                    <h3>{t('auth.student')}</h3>
                    <p className="student-email-hint">@emsi-edu.ma</p>
                </div>
                {accountType === 'student' && <CheckCircle className="check-icon" size={24} />}
            </button>
            <button
                type="button"
                onClick={() => setAccountType('professor')}
                className={`type-btn-large ${accountType === 'professor' ? 'active' : ''}`}
            >
                <div className="icon-box"><BookOpen size={32} /></div>
                <div>
                    <h3>{t('auth.professor')}</h3>
                    <p className="student-email-hint">@emsi.ma</p>
                </div>
                {accountType === 'professor' && <CheckCircle className="check-icon" size={24} />}
            </button>
        </div>
    );
};

export default RegisterStep1;
