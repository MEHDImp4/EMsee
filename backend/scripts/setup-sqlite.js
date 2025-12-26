const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const localSchemaPath = path.join(__dirname, '../prisma/schema.local.prisma');

try {
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // 1. Replace provider and url
    schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
    schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = "file:./dev.db"');

    // 2. Handle Enums (SQLite doesn't support them, convert to String)
    // Find all enums
    const enumRegex = /enum\s+(\w+)\s+\{([\s\S]*?)\}/g;
    let match;
    const enums = [];

    // First pass: Collect all enums and their values
    while ((match = enumRegex.exec(schema)) !== null) {
        const name = match[1];
        const body = match[2];
        const values = body.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('//')) // Ignore comments/empty
            .map(line => line.split(/\s+/)[0]); // Get just the value name

        enums.push({ name, values });
    }

    // Second pass: Remove enum definitions and update usages
    enums.forEach(({ name, values }) => {
        // Remove the enum definition block
        const specificEnumRegex = new RegExp(`enum\\s+${name}\\s+\\{[\\s\\S]*?\\}`, 'g');
        schema = schema.replace(specificEnumRegex, '');

        // Replace field type usage "Field Type" -> "Field String"
        // Look for "fieldName EnumName" pattern
        // We use a regex that matches the type name considering it might be optional "?" or array "[]" (though array of enums not supported in sqlite either)
        // But simply replacing the word is risky if it matches field names.
        // Prisma fields are "name Type @attributes"
        // Let's replace " : Type" or just "\sType\s"
        // Being safe: Replace " Name " with " String ", " Name?" with " String?", " Name[]" with " String[]"
        // Actually, just replacing the word boundary matches in the schema body should work if we are careful not to replace the model name if it was same (unlikely for enums).

        // Replace type usage
        const typeRegex = new RegExp(`(\\s+)${name}([\\[\\]?]*)(\\s+)`, 'g');
        schema = schema.replace(typeRegex, `$1String$2$3`);

        // Update default values: @default(VALUE) -> @default("VALUE")
        values.forEach(val => {
            const defaultRegex = new RegExp(`@default\\(${val}\\)`, 'g');
            schema = schema.replace(defaultRegex, `@default("${val}")`);
        });
    });

    // 3. Handle specific PostgreSQL types not supported in SQLite if any (e.g. Json is supported, Text is supported effectively)
    // @db.Text -> SQLite ignores or is fine? Prisma usually handles @db.Text for SQLite by mapping to String.
    // However, clean up @db.Text might be safer but Prisma Client usually warns or ignores.
    // Let's remove @db.Text and @db.VarChar just to be clean.
    schema = schema.replace(/@db\.Text/g, '');
    schema = schema.replace(/@db\.VarChar\(\d+\)/g, '');

    // 4. Force Json -> String (Polyfill for SQLite local)
    // We will handle JSON parsing in Prisma Client Extension
    schema = schema.replace(/\sJson\??/g, match => match.replace('Json', 'String'));


    // Write to new file
    fs.writeFileSync(localSchemaPath, schema, 'utf8');

    console.log('Successfully created prisma/schema.local.prisma for SQLite.');
} catch (error) {
    console.error('Error creating local schema:', error);
    process.exit(1);
}
