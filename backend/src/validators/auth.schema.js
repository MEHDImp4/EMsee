const { z } = require('zod');

// Schema Helper - Common patterns
const passwordSchema = z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe est trop long')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule');

const usernameSchema = z.string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur est trop long")
    .regex(/^[a-zA-Z0-9_]+$/, "Le nom d'utilisateur ne doit contenir que des lettres, chiffres et underscores");

// Email domains by role
const DOMAINS = {
    student: '@emsi-edu.ma',
    professor: '@emsi.ma',
    admin: '@emsi.ma'
};

const registerSchema = z.object({
    body: z.object({
        username: usernameSchema,
        email: z.string().email('Email invalide'),
        password: passwordSchema,
        full_name: z.string().min(2, 'Le nom complet doit contenir au moins 2 caractères'),
        role: z.enum(['student', 'professor', 'admin']),
        filiere: z.string().optional(),
        year: z.string().optional(),
        studentClass: z.string().optional(),
        subjects: z.array(z.string()).optional()
    }).superRefine((data, ctx) => {
        // Validate email domain based on role
        const requiredDomain = DOMAINS[data.role];
        if (requiredDomain && !data.email.endsWith(requiredDomain)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `L'email doit se terminer par ${requiredDomain} pour le rôle ${data.role}`,
                path: ['email']
            });
        }

        // Validate student-specific fields
        if (data.role === 'student') {
            if (!data.filiere) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La filière est requise pour les étudiants',
                    path: ['filiere']
                });
            }
            if (!data.year) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "L'année est requise pour les étudiants",
                    path: ['year']
                });
            }
        }

        // Validate professor-specific fields
        if (data.role === 'professor') {
            if (!data.subjects || data.subjects.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Au moins une matière est requise pour les professeurs',
                    path: ['subjects']
                });
            }
        }
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Email invalide').or(usernameSchema),
        // Allow email or username if logic supports it. 
        // Note: Controller 'login' uses 'findByEmail'. So practically this expects email unless logic changes.
        // Keeping strict 'email' validation might be safer if logic only supports email, 
        // but 'or(usernameSchema)' allows passing validation to let Controller decide (or fail with 401).
        password: z.string().min(1, 'Mot de passe requis')
    })
});

const updateProfileSchema = z.object({
    body: z.object({
        bio: z.string().optional(),
        filiere: z.string().optional(),
        year: z.string().optional(),
        // Avatar/Banner: handled by multer
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema
};
