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

const registerSchema = z.object({
    body: z.object({
        username: usernameSchema,
        email: z.string().email('Email invalide'),
        password: passwordSchema,
        full_name: z.string().optional(),
        filiere: z.string().optional(),
        year: z.string().optional(),
        studentClass: z.string().optional().transform(val => val?.toUpperCase()),
        subjects: z.array(z.string()).optional()
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
