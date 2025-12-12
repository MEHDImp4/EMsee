const { z } = require('zod');

// Allowed email domains maps
const DOMAINS = {
    student: '@emsi-edu.ma',
    professor: '@emsi.ma',
    admin: '@emsi.ma' // Assuming admins use the staff domain
};

const registerSchema = z.object({
    username: z.string()
        .min(2, 'Username must be at least 2 characters')
        .regex(/^[a-z0-9.]+$/, 'Username must be alphanumeric and lowercase (dots allowed)'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.enum(['student', 'professor', 'admin']),

    // Optional fields depending on role, validated more strictly if present
    filiere: z.string().optional(),
    year: z.string().optional(),
    studentClass: z.string().optional(), // Can be empty string in frontend logic? Let's allow string or optional.
    subjects: z.array(z.string()).optional()
}).superRefine((data, ctx) => {
    // Validate Email Domain based on Role
    const requiredDomain = DOMAINS[data.role];
    if (requiredDomain && !data.email.endsWith(requiredDomain)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Email must end with ${requiredDomain} for role ${data.role}`,
            path: ['email']
        });
    }

    // Validate Student Specific Fields
    if (data.role === 'student') {
        if (!data.filiere) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Filiere is required for students', path: ['filiere'] });
        }
        if (!data.year) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year is required for students', path: ['year'] });
        }
    }

    // Validate Professor Specific Fields
    if (data.role === 'professor') {
        if (!data.subjects || data.subjects.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least one subject is required for professors', path: ['subjects'] });
        }
    }
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    bio: z.string().max(300, 'Bio too long').optional().nullable(),
    location: z.string().max(100, 'Location too long').optional().nullable(),
    filiere: z.string().optional(),
    year: z.string().optional()
    // Avatar and banner are handled by multer and verifyToken, not body validation strictly here, 
    // but the controller reads them from req.files
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema
};
