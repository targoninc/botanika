export function env(name, fallback = undefined) {
    return process.env[name] ?? fallback;
}